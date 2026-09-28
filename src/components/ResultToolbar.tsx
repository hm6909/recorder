import { Minus, Plus, Eye, Music2 } from 'lucide-react';
interface Props { zoom:number; onZoom:(zoom:number)=>void; showNotes:boolean; onShow:(show:boolean)=>void; analyzed:boolean }
export default function ResultToolbar({zoom,onZoom,showNotes,onShow,analyzed}:Props) {
  return <div className="result-toolbar"><div className="zoom-controls"><span className="zoom-caption">악보 크기</span><button aria-label="축소" title="축소" disabled={zoom<=0.5} onClick={()=>onZoom(Math.max(0.5,zoom-0.25))}><Minus size={18}/> 축소</button><output>{Math.round(zoom*100)}%</output><button aria-label="확대" title="확대" disabled={zoom>=3} onClick={()=>onZoom(Math.min(3,zoom+0.25))}><Plus size={18}/> 확대</button><button className="reset-zoom" onClick={()=>onZoom(1)}>100%</button></div><div className="view-controls"><button aria-pressed={!showNotes} onClick={()=>onShow(false)}><Eye size={18}/>원본 보기</button><button disabled={!analyzed} aria-pressed={showNotes} onClick={()=>onShow(true)}><Music2 size={18}/>계이름 보기</button></div></div>;
}

