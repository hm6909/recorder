import { WandSparkles } from 'lucide-react';
import PartSelector from './PartSelector';
import type { PartSelection } from '../types/music';
interface Props { part:PartSelection; onPart:(part:PartSelection)=>void; onAnalyze:()=>void; disabled:boolean; busy:boolean }
export default function ControlPanel({part,onPart,onAnalyze,disabled,busy}:Props) {
  return <section className="controls"><div><h2><span className="step">2</span> 표시할 파트를 골라요</h2><PartSelector value={part} onChange={onPart}/></div><button className="primary convert" disabled={disabled||busy} onClick={onAnalyze}><WandSparkles size={22}/>{busy?'악보를 살펴보고 있어요…':'🎼 계이름 변환하기'}</button></section>;
}



