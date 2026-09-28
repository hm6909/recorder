import { recognize } from './omr/recognizer';
import type { AnalysisResult, ScoreImage, ScoreLayout } from '../types/music';

/** Analyze locally in the browser; the source image is never uploaded. */
export async function analyzeScore(image: ScoreImage, layout: ScoreLayout): Promise<AnalysisResult> {
  const bitmap = new Image();
  bitmap.src = image.url;
  await bitmap.decode();
  const scale = Math.min(1, 1800 / image.width, 2400 / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('사진을 분석할 수 없어요.');
  context.drawImage(bitmap, 0, 0, width, height);
  const result = recognize(context.getImageData(0, 0, width, height).data, width, height, layout);
  return { ...result, notes: result.notes.map(note => ({ ...note, x: note.x / scale, y: note.y / scale })) };
}
