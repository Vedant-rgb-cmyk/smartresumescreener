import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: number;
  education: string;
}

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("npm:pdfjs-dist@4.8.69/legacy/build/pdf.mjs");
  const data = new Uint8Array(arrayBuffer);
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item: { str?: string }) => item.str ?? "")
      .join(" ") + "\n";
  }
  return text;
}

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("npm:mammoth@1.8.0/mammoth.browser.min.mjs");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
  const systemPrompt = `You are a resume parser. Extract structured candidate information from the resume text.
Return ONLY valid JSON with this exact structure:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "skills": ["skill1", "skill2"],
  "experience": 0,
  "education": "highest education"
}
Rules:
- "experience" must be a number representing total years of professional experience (0 if unknown).
- "skills" must be an array of strings.
- Use empty string "" for text fields if not found, empty array [] for skills if not found.
- Do not include any text outside the JSON.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: resumeText.slice(0, 12000) },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");

  const parsed = JSON.parse(content) as ParsedResume;
  return {
    name: String(parsed.name ?? ""),
    email: String(parsed.email ?? ""),
    phone: String(parsed.phone ?? ""),
    skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
    experience: Number(parsed.experience) || 0,
    education: String(parsed.education ?? ""),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { candidateId } = await req.json();
    if (!candidateId) {
      return new Response(JSON.stringify({ error: "Missing candidateId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: candidate, error: fetchError } = await supabase
      .from("candidates")
      .select("id, job_id, resume_file_path, resume_text")
      .eq("id", candidateId)
      .maybeSingle();

    if (fetchError || !candidate) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let resumeText = candidate.resume_text;

    if (!resumeText && candidate.resume_file_path) {
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from("resumes")
        .download(candidate.resume_file_path);

      if (downloadError || !fileData) {
        await supabase
          .from("candidates")
          .update({ parse_status: "failed" })
          .eq("id", candidateId);
        return new Response(JSON.stringify({ error: "Could not download resume file" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const fileName = candidate.resume_file_path.toLowerCase();

      try {
        if (fileName.endsWith(".pdf")) {
          resumeText = await extractPdfText(arrayBuffer);
        } else if (fileName.endsWith(".docx")) {
          resumeText = await extractDocxText(arrayBuffer);
        } else {
          resumeText = new TextDecoder().decode(arrayBuffer);
        }
      } catch (extractError) {
        await supabase
          .from("candidates")
          .update({ parse_status: "failed" })
          .eq("id", candidateId);
        return new Response(
          JSON.stringify({ error: `Text extraction failed: ${extractError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
      await supabase
        .from("candidates")
        .update({ parse_status: "failed" })
        .eq("id", candidateId);
      return new Response(JSON.stringify({ error: "No text could be extracted from the resume" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = await parseResumeWithAI(resumeText);

    const { error: updateError } = await supabase
      .from("candidates")
      .update({
        name: parsed.name || "Unnamed candidate",
        email: parsed.email || null,
        phone: parsed.phone || null,
        skills: parsed.skills,
        experience: String(parsed.experience),
        education: parsed.education || null,
        resume_text: resumeText,
        parse_status: "completed",
      })
      .eq("id", candidateId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true, parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Resume parsing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
