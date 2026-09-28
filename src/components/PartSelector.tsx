import type { PartSelection } from '../types/music';
const parts: [PartSelection, string][] = [
  ['soprano1', '소프라노'], ['alto', '알토'], ['tenor', '테너'], ['bass', '베이스'], ['all', '전체'],
];
export default function PartSelector({ value, onChange, enabled = true }: { value: PartSelection; onChange: (part: PartSelection) => void; enabled?: boolean }) {
  return <div className="parts" role="group" aria-label="악보 파트 선택">{parts.map(([part, label]) =>
    <button key={part} aria-pressed={value === part} disabled={!enabled && part !== 'all'} className={value === part ? 'selected' : ''} onClick={() => onChange(part)}>{label}</button>,
  )}</div>;
}

