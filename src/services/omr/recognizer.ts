import type { AnalysisResult, Note, Part, ScoreLayout, Staff } from '../../types/music';

// Experimental, local image processing. No sample-specific coordinates or mock fallback.
// Assumptions: printed Western notation, nearly horizontal staves, natural notes.
export function binarize(rgba: Uint8ClampedArray, width:number, height:number): Uint8Array {
  const gray = new Uint8Array(width*height);
  const integral = new Float64Array((width+1)*(height+1));
  for(let y=0;y<height;y++) {
    let row=0;
    for(let x=0;x<width;x++) {
      const i=y*width+x,p=i*4;
      gray[i]=Math.round((rgba[p]*.299+rgba[p+1]*.587+rgba[p+2]*.114)*(rgba[p+3]/255)+255*(1-rgba[p+3]/255));
      row+=gray[i];integral[(y+1)*(width+1)+x+1]=integral[y*(width+1)+x+1]+row;
    }
  }
  const binary=new Uint8Array(width*height),radius=18;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const x0=Math.max(0,x-radius),x1=Math.min(width,x+radius+1),y0=Math.max(0,y-radius),y1=Math.min(height,y+radius+1);
    const mean=(integral[y1*(width+1)+x1]-integral[y0*(width+1)+x1]-integral[y1*(width+1)+x0]+integral[y0*(width+1)+x0])/((x1-x0)*(y1-y0));
    binary[y*width+x]=gray[y*width+x]<mean-24?1:0;
  }
  return binary;
}

export function findStaves(binary:Uint8Array,width:number,height:number):Staff[] {
  const centerX=width/2,left=Math.round(width*.16),right=Math.round(width*.89);
  const candidates:(Staff & {score:number})[]=[];
  const points:number[]=[];
  for(let y=8;y<height-8;y++)for(let x=left;x<right;x+=2)if(binary[y*width+x])points.push(x,y);
  for(let slope=-.06;slope<=.0601;slope+=.004) {
    const hist=new Float64Array(height);
    for(let i=0;i<points.length;i+=2){const y=Math.round(points[i+1]-slope*(points[i]-centerX));if(y>=0&&y<height)hist[y]+=2/(right-left);}
    const smooth=hist.map((v,i)=>v+(hist[i-1]||0)*.6+(hist[i+1]||0)*.6);
    const peaks:number[]=[];
    for(let y=3;y<height-3;y++)if(smooth[y]>.48&&smooth[y]>=smooth[y-1]&&smooth[y]>smooth[y+1])peaks.push(y);
    for(let a=0;a<peaks.length;a++)for(let b=a+1;b<peaks.length;b++) {
      const gap=peaks[b]-peaks[a];if(gap<5)continue;if(gap>22)break;
      const lines=[peaks[a],peaks[b]];let score=smooth[peaks[a]]+smooth[peaks[b]];
      for(let k=2;k<5;k++) {
        const target=peaks[a]+gap*k;
        const match=peaks.find(p=>Math.abs(p-target)<=1.5);
        if(match===undefined)break;lines.push(match);score+=smooth[match];
      }
      if(lines.length===5)candidates.push({top:lines[0],gap:(lines[4]-lines[0])/4,slope,centerX,left:0,right:width-1,score});
    }
  }
  candidates.sort((a,b)=>b.score-a.score);
  const selected:Staff[]=[];
  for(const staff of candidates){if(selected.some(s=>Math.abs(s.top+2*s.gap-staff.top-2*staff.gap)<Math.max(s.gap,staff.gap)*4))continue;selected.push(staff);}
  selected.sort((a,b)=>a.top-b.top);
  // Locate staff endpoints using agreement of the five lines, avoiding page borders.
  return selected.map(s=>{
    const supported:number[]=[];
    for(let x=2;x<width-2;x++) {
      let hits=0;
      for(let line=0;line<5;line++) {
        const y=Math.round(s.top+line*s.gap+s.slope*(x-centerX));
        if([-1,0,1].some(d=>y+d>=0&&y+d<height&&binary[(y+d)*width+x]))hits++;
      }
      if(hits>=4)supported.push(x);
    }
    const runs:number[][]=[];let run:number[]=[];
    for(const x of supported){if(run.length&&x-run[run.length-1]>s.gap*3){runs.push(run);run=[];}run.push(x);}if(run.length)runs.push(run);
    const longest=runs.sort((a,b)=>b.length-a.length)[0];
    return {...s,left:longest?.[0]??0,right:longest?.[longest.length-1]??width-1};
  }).filter(s=>s.right-s.left>width*.4);
}

function pitchForStep(step:number,bass:boolean):string {
  // Bottom line = E4 in treble clef, G2 in bass clef. Written pitch, fixed Do.
  const index=(bass?2*7+4:4*7+2)+step;
  return 'CDEFGAB'[((index%7)+7)%7]+Math.floor(index/7);
}

export function recognize(rgba:Uint8ClampedArray,width:number,height:number,layout:ScoreLayout):AnalysisResult {
  const binary=binarize(rgba,width,height),staves=findStaves(binary,width,height);
  if(!staves.length)throw new Error('오선을 찾지 못했어요. 악보를 반듯하게, 더 가까이 찍어 주세요.');
  const parts:Part[]=layout==='satb'?['soprano1','alto','tenor','bass']:layout==='ssa'?['soprano1','soprano2','alto']:['soprano1'];
  const partAssignmentReliable=staves.length%parts.length===0;
  const notes:Note[]=[];
  const pixel=(x:number,y:number)=>x>=0&&x<width&&y>=0&&y<height?binary[Math.round(y)*width+Math.round(x)]||0:0;
  staves.forEach((staff,staffIndex)=>{
    const gap=staff.gap,part=parts[staffIndex%parts.length];
    const candidates:{x:number;y:number;score:number;step:number}[]=[];
    for(let step=-4;step<=14;step++)for(let x=Math.ceil(staff.left+gap*5);x<staff.right-gap;x++) {
      const expected=staff.top+4*gap-step*gap/2+staff.slope*(x-staff.centerX);
      let best:{x:number;y:number;score:number;step:number}|undefined;
      for(const offset of [-1,0,1]) {
        const y=Math.round(expected+offset);
        let ink=0,count=0,ringInk=0,ringCount=0;
        const rx=gap*.60,ry=gap*.37;
        for(let dy=-Math.ceil(gap*.8);dy<=Math.ceil(gap*.8);dy++)for(let dx=-Math.ceil(gap*.85);dx<=Math.ceil(gap*.85);dx++) {
          const rotatedY=dy+dx*.3;
          const distance=(dx/rx)**2+(rotatedY/ry)**2;
          const localY=y+dy-staff.slope*(x+dx-staff.centerX);
          const lineIndex=Math.round((localY-staff.top)/gap);
          if(Math.abs(localY-staff.top-lineIndex*gap)<1.25)continue;
          if(distance<=1){ink+=pixel(x+dx,y+dy);count++;}
          else if(distance>=1.6&&distance<=3.0){ringInk+=pixel(x+dx,y+dy);ringCount++;}
        }
        if(!count||!ringCount)continue;
        const fill=ink/count,ring=ringInk/ringCount;
        if(fill<.70||ring>.46)continue;
        let stem=0;
        for(const direction of [-1,1])for(let dx=-1;dx<=1;dx++) {
          const stemX=x+direction*gap*.58+dx;let hits=0,total=0;
          for(let distance=gap*.65;distance<=gap*2.5;distance++){hits+=pixel(stemX,y-direction*distance);total++;}
          stem=Math.max(stem,hits/total);
        }
        if(stem<.65)continue;
        const score=fill-ring*.9+stem*.15-Math.abs(offset)*.008;
        if(!best||score>best.score)best={x,y,score,step};
      }
      if(best)candidates.push(best);
    }
    candidates.sort((a,b)=>b.score-a.score);
    const accepted:typeof candidates=[];
    for(const c of candidates){if(accepted.some(n=>Math.abs(n.x-c.x)<gap*1.05&&Math.abs(n.y-c.y)<gap*1.15))continue;accepted.push(c);}
    accepted.sort((a,b)=>a.x-b.x);
    for(const head of accepted)notes.push({id:notes.length+1,x:head.x,y:head.y,pitch:pitchForStep(head.step,part==='bass'),part,staff:staffIndex+1,confidence:Math.min(.9,Math.max(.3,head.score*.8))});
  });
  if(!notes.length)throw new Error('오선은 찾았지만 음표를 찾지 못했어요. 더 선명한 사진으로 다시 시도해 주세요.');
  const warnings=[
    '검은 음표 머리 중심의 실험용 인식입니다. 흰 음표·쉼표·장식음은 누락되거나 잘못 표시될 수 있어요.',
    '조표·샵·플랫·제자리표는 자동 인식하지 않아요. 표시된 계이름을 악보와 비교해 확인해 주세요.',
    '파트와 음자리표는 선택한 악보 구성에 따라 배정합니다. 자동으로 읽은 결과가 아니에요.',
  ];
  if(!partAssignmentReliable)warnings.unshift(`오선 ${staves.length}개를 찾았어요. 일부 오선을 놓쳤을 수 있어 파트 구분이 불확실합니다. 전체 악보 보기로 확인해 주세요.`);
  return {notes,staffCount:staves.length,partAssignmentReliable,warnings};
}
