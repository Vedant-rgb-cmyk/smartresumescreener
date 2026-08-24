import { supabase } from '@/lib/supabaseClient';

export type ParsedCandidate = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: number;
  education: string;
};

export async function parseResume(
  candidateId: string,
): Promise<{ success: true; parsed: ParsedCandidate } | { success: false; error: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`;
  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ candidateId }),
    });
  } catch {
    return { success: false, error: 'Could not reach the parsing service.' };
  }

  if (!response.ok) {
    let message = `Parsing failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    return { success: false, error: message };
  }

  const body = await response.json();
  if (!body?.parsed) {
    return { success: false, error: 'Parsing completed but returned no data.' };
  }
  return { success: true, parsed: body.parsed as ParsedCandidate };
}
