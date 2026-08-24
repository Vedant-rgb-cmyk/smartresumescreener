import { FileSearch } from 'lucide-react';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
};

const sizeMap = {
  sm: { icon: 18, text: 'text-base' },
  md: { icon: 24, text: 'text-lg' },
  lg: { icon: 32, text: 'text-2xl' },
};

export default function Logo({ size = 'md', light = false }: Props) {
  const s = sizeMap[size];
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
        <FileSearch size={s.icon} className="m-1.5" />
      </div>
      <span className={`font-bold tracking-tight ${s.text} ${light ? 'text-white' : 'text-slate-900'}`}>
        Smart<span className="text-blue-600">Screener</span>
      </span>
    </div>
  );
}
