import { useEffect, useRef, useState } from 'react';
import { Music2, ImagePlus, Check, Info, FileImage, ArrowRight } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ScoreViewer from './components/ScoreViewer';
import ControlPanel from './components/ControlPanel';
import ResultToolbar from './components/ResultToolbar';
import { analyzeScore } from './services/omrService';
import type { AnalysisResult, PartSelection, ScoreImage } from './types/music';

export default function App() {
  const [image, setImage] = useState<ScoreImage | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [part, setPart] = useState<PartSelection>('all');
  const [zoom, setZoom] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const generation = useRef(0);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url); }, [image]);
  useEffect(() => () => { generation.current++; }, []);

  async function upload(file: File) {
    const request = ++generation.current;
    setError(''); setBusy(false);
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('JPG, JPEG, PNG 사진을 선택해 주세요.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('20MB 이하의 사진을 선택해 주세요.'); return; }
    const url = URL.createObjectURL(file);
    const loaded = new Image(); loaded.src = url;
    try {
      await loaded.decode();
      if (request !== generation.current) { URL.revokeObjectURL(url); return; }
      setImage({ url, name: file.name, width: loaded.naturalWidth, height: loaded.naturalHeight });
      setAnalysis(null); setShowNotes(false); setZoom(1);
    } catch {
      URL.revokeObjectURL(url);
      if (request === generation.current) setError('사진을 열 수 없어요. 다른 사진을 선택해 주세요.');
    }
  }

  async function analyze() {
    if (!image) return;
    const request = generation.current;
    setBusy(true); setError('');
    try {
      const result = await analyzeScore(image, 'satb');
      if (request !== generation.current) return;
      setAnalysis(result); setShowNotes(true); setPart('soprano1');
    } catch (reason) {
      if (request === generation.current) {
        setError(reason instanceof Error ? reason.message : '악보 분석에 실패했어요. 사진을 확인하고 다시 시도해 주세요.');
        setAnalysis(null); setShowNotes(false);
      }
    } finally { if (request === generation.current) setBusy(false); }
  }

  const notes = (analysis?.notes ?? []).filter(note => part === 'all' || note.part === part);
  return <><header className="site-header"><div className="brand"><span className="brand-icon"><Music2 size={22}/></span>우리들의 음악 시간</div><span className="club-tag">초등 리코더 동아리</span></header>
    <main><section className="hero"><div className="eyebrow"><span/> 한 음씩, 즐겁게 배워요</div><h1>🎵 리코더 계이름 도우미</h1><p>악보를 찍으면 계이름을 알려줘요!</p><div className="steps"><span className="active"><b>1</b>사진 올리기</span><ArrowRight size={16}/><span className={image ? 'active' : ''}><b>2</b>파트 고르기</span><ArrowRight size={16}/><span className={analysis ? 'active' : ''}><b>3</b>계이름 확인</span></div></section>
    <section className="workspace"><div className="card-heading"><h2><span className="step">1</span> 나의 악보</h2><span className="file-types">JPG · JPEG · PNG</span></div>
      {!image ? <div className={`empty-score ${dragging ? 'dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) void upload(e.dataTransfer.files[0]); }}><div className="illustration"><div className="paper-art"><span>♫</span><i/><i/><i/><i/><i/><strong>♩ ♪ ♩</strong></div><span className="upload-bubble"><ImagePlus size={27}/></span><span className="sparkle">✦</span></div><h3>악보 사진을 올려주세요.</h3><p>사진을 선택하거나 이곳에 끌어다 놓아요.</p><ImageUploader onFile={upload}/><small>최대 20MB · 악보 전체가 선명하게 나오면 좋아요</small></div>
      : <><div className="file-row"><span><FileImage size={18}/>{image.name}</span><ImageUploader compact onFile={upload}/></div><ResultToolbar zoom={zoom} onZoom={setZoom} showNotes={showNotes} onShow={setShowNotes} analyzed={!!analysis}/><ScoreViewer image={image} notes={notes} zoom={zoom} onZoom={setZoom} showNotes={showNotes}/></>}
      {error && <p className="error" role="alert">{error}</p>}
      <ControlPanel part={part} onPart={setPart} onAnalyze={analyze} disabled={!image} busy={busy} />
    </section>
    <div className="demo-notice" role="status"><Info size={21}/><div><strong>{analysis ? `사진에서 오선 ${analysis.staffCount}개, 음표 ${analysis.notes.length}개를 찾았어요.` : '사진은 내 기기에서 분석돼요.'}</strong><p>{analysis ? analysis.warnings.join(' ') : '현재는 실험적인 오선·검은 음표 인식이에요. 모든 음표와 조표를 정확히 읽는 기능은 아니므로 결과를 악보와 비교해 확인해 주세요.'}</p></div><span className="demo-badge">실험 중</span></div>
    <section className="tips"><div className="tip-heading">사진은 이렇게 찍어주세요</div><span><Check size={17}/> 악보를 반듯하게</span><span><Check size={17}/> 밝은 곳에서 선명하게</span><span><Check size={17}/> 오선이 모두 보이게</span></section>
    <footer><Music2 size={16}/> 작은 연습이 모여, 멋진 연주가 돼요.</footer></main></>;
}




