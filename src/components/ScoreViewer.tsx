import { useEffect, useRef, useState } from 'react';
import type { Note, ScoreImage } from '../types/music';
import { pitchToSolfege } from '../utils/noteUtils';
interface Props { image:ScoreImage; notes:Note[]; zoom:number; onZoom:(zoom:number)=>void; showNotes:boolean }
const clampZoom=(value:number)=>Math.max(.5,Math.min(3,value));
export default function ScoreViewer({image,notes,zoom,onZoom,showNotes}:Props) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const zoomRef=useRef(zoom);
  zoomRef.current=zoom;
  const [available,setAvailable] = useState(800);
  useEffect(()=>{
    const element=container.current!;
    const observer=new ResizeObserver(([entry])=>setAvailable(Math.max(1,entry.contentRect.width-32)));
    observer.observe(element); return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const element=container.current;
    if(!element)return;
    let pinchStartDistance=0;
    let pinchStartZoom=zoomRef.current;
    let previousX=0,previousY=0;
    const distance=(touches:TouchList)=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
    const handleStart=(event:TouchEvent)=>{
      if(event.touches.length===2){
        event.preventDefault();
        pinchStartDistance=distance(event.touches);
        pinchStartZoom=zoomRef.current;
      }else if(event.touches.length===1){
        previousX=event.touches[0].clientX;previousY=event.touches[0].clientY;
      }
    };
    const handleMove=(event:TouchEvent)=>{
      if(event.touches.length===2){
        event.preventDefault();
        const oldZoom=zoomRef.current;
        const nextZoom=clampZoom(pinchStartZoom*distance(event.touches)/pinchStartDistance);
        const rect=element.getBoundingClientRect();
        const centerX=(event.touches[0].clientX+event.touches[1].clientX)/2-rect.left-element.clientLeft;
        const centerY=(event.touches[0].clientY+event.touches[1].clientY)/2-rect.top-element.clientTop;
        onZoom(nextZoom);
        requestAnimationFrame(()=>{
          const ratio=nextZoom/oldZoom;
          element.scrollLeft=(element.scrollLeft+centerX)*ratio-centerX;
          element.scrollTop=(element.scrollTop+centerY)*ratio-centerY;
        });
      }else if(event.touches.length===1){
        event.preventDefault();
        const touch=event.touches[0];
        const dx=touch.clientX-previousX,dy=touch.clientY-previousY;
        previousX=touch.clientX;previousY=touch.clientY;
        if(zoomRef.current>1.01){element.scrollLeft-=dx;element.scrollTop-=dy;}
        else window.scrollBy(0,-dy);
      }
    };
    const handleEnd=(event:TouchEvent)=>{
      if(event.touches.length===1){previousX=event.touches[0].clientX;previousY=event.touches[0].clientY;}
      else pinchStartDistance=0;
    };
    element.addEventListener('touchstart',handleStart,{passive:false});
    element.addEventListener('touchmove',handleMove,{passive:false});
    element.addEventListener('touchend',handleEnd,{passive:false});
    element.addEventListener('touchcancel',handleEnd,{passive:false});
    return ()=>{
      element.removeEventListener('touchstart',handleStart);
      element.removeEventListener('touchmove',handleMove);
      element.removeEventListener('touchend',handleEnd);
      element.removeEventListener('touchcancel',handleEnd);
    };
  },[onZoom]);
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
    const fontSize=Math.max(11,Math.min(18,16*width/Math.max(image.width,760)));
    ctx.font=`bold ${fontSize}px "Noto Sans KR", Arial, sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,fontSize*.2);
    notes.forEach(note=>{
      const text=pitchToSolfege(note.pitch);
      const x=Math.max(22*zoom,Math.min(width-22*zoom,note.x*scaleX));
      const y=Math.max(24*zoom,note.y*scaleY-fontSize*.8);
      ctx.strokeStyle='#ffffff';ctx.strokeText(text,x,y);ctx.fillStyle='#245bc1';ctx.fillText(text,x,y);
    });
  },[width,height,image,notes,showNotes,zoom]);
  return <><div className="score-scroll" ref={container}><div className="score-paper" style={{width,height}}><img src={image.url} alt={`업로드한 악보: ${image.name}`} style={{width,height}}/><canvas ref={canvas} style={{width,height}} aria-label={showNotes ? `인식된 계이름: ${notes.map(n=>pitchToSolfege(n.pitch)).join(', ')}`:'계이름 숨김'}/></div></div><p className="score-gesture-help">두 손가락을 벌리거나 오므려 확대·축소하고, 확대 후에는 한 손가락으로 악보를 움직여 보세요.</p></>;
}
