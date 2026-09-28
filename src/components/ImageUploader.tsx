import { Camera, Upload } from 'lucide-react';
import { useRef } from 'react';
interface Props { onFile: (file: File) => void; compact?: boolean }
export default function ImageUploader({onFile, compact}: Props) {
  const upload = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const choose = (files: FileList | null) => { if(files?.[0]) onFile(files[0]); };
  return <div className={compact ? 'uploader compact' : 'uploader'}>
    <input ref={upload} aria-label="이미지 업로드" type="file" accept="image/*" onChange={e=>{choose(e.target.files);e.target.value='';}} hidden/>
    <input ref={camera} aria-label="카메라 촬영" type="file" accept="image/*" capture="environment" onChange={e=>{choose(e.target.files);e.target.value='';}} hidden/>
    <button className="primary" onClick={()=>upload.current?.click()}><Upload size={21}/> {compact ? '다른 악보 선택' : '악보 사진 올리기'}</button>
    {!compact && <button className="secondary" onClick={()=>camera.current?.click()}><Camera size={21}/> 카메라로 찍기</button>}
  </div>;
}
