import type { Note } from '../types/music';
export const MOCK_WIDTH = 1000;
export const MOCK_HEIGHT = 600;
export const mockNotes: Note[] = [
  {id:1,x:160,y:180,pitch:'C4',part:'soprano1'},
  {id:2,x:350,y:170,pitch:'D4',part:'soprano1'},
  {id:3,x:540,y:160,pitch:'E4',part:'soprano1'},
  {id:4,x:730,y:150,pitch:'F4',part:'soprano1'},
  {id:5,x:160,y:315,pitch:'G4',part:'soprano2'},
  {id:6,x:410,y:305,pitch:'A4',part:'soprano2'},
  {id:7,x:660,y:295,pitch:'B4',part:'soprano2'},
  {id:8,x:160,y:450,pitch:'C5',part:'alto'},
  {id:9,x:410,y:440,pitch:'C#4',part:'alto'},
  {id:10,x:660,y:430,pitch:'Bb4',part:'alto'},
];
