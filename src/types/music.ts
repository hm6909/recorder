export type Part = 'soprano1' | 'soprano2' | 'alto' | 'tenor' | 'bass';
export type PartSelection = Part | 'all';
export type ScoreLayout = 'satb' | 'ssa' | 'solo';
export interface Note { id:number; x:number; y:number; pitch:string; part:Part; staff?:number; confidence?:number; corrected?:boolean }
export interface ScoreImage { url:string; name:string; width:number; height:number }
export interface Staff { top:number; gap:number; slope:number; centerX:number; left:number; right:number }
export interface AnalysisResult { notes:Note[]; staffCount:number; warnings:string[] }
