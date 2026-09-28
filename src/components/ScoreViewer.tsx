import { useEffect, useRef, useState } from 'react';
import type { Note, ScoreImage } from '../types/music';
import { pitchToSolfege } from '../utils/noteUtils';
interface Props { image:ScoreImage; notes:Note[]; zoom:number; showNotes:boolean }
export default function ScoreViewer({image,notes,zoom,showNotes}:Props) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [available,setAvailable] = useState(800);
  useEffect(()=>{
    const element=container.current!;
    const observer=new ResizeObserver(([entry])=>setAvailable(Math.max(1,entry.contentRect.width-32)));
    observer.observe(element); return ()=>observer.disconnect();
  },[]);
  const width=Math.min(available,image.width)*zoom;
  const height=width*image.height/image.width;
  useEffect(()=>{
    const surface=canvas.current!;
    const ratio=window.devicePixelRatio||1;
    surface.width=Math.round(width*ratio);surface.height=Math.round(height*ratio);
    const ctx=surface.getContext('2d');if(!ctx)return;
    ctx.scale(ratio,ratio);ctx.clearRect(0,0,width,height);
    if(!showNotes)return;
    const scaleX=width/image.width,scaleY=height/image.height;
    ctx.font=`bold ${20*zoom}px "Noto Sans KR", Arial, sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineJoin='round';ctx.lineWidth=4*zoom;
    notes.forEach(note=>{
      const text=pitchToSolfege(note.pitch);
      const x=Math.max(22*zoom,Math.min(width-22*zoom,note.x*scaleX));
      const y=Math.max(24*zoom,note.y*scaleY-12*zoom);
      ctx.strokeStyle='#ffffff';ctx.strokeText(text,x,y);ctx.fillStyle='#245bc1';ctx.fillText(text,x,y);
    });
  },[width,height,image,notes,showNotes,zoom]);
  return <div className="score-scroll" ref={container}><div className="score-paper" style={{width,height}}><img src={image.url} alt={`업로드한 악보: ${image.name}`} style={{width,height}}/><canvas ref={canvas} style={{width,height}} aria-label={showNotes ? `테스트 계이름: ${notes.map(n=>pitchToSolfege(n.pitch)).join(', ')}`:'계이름 숨김'}/></div></div>;
}

