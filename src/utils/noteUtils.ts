const names: Record<string,string> = {C:'도',D:'레',E:'미',F:'파',G:'솔',A:'라',B:'시'};
export function pitchToSolfege(pitch: string): string {
  const match = /^([A-G])([#b♯♭]?)(-?\d+)?$/.exec(pitch);
  if (!match) return pitch;
  return names[match[1]] + match[2].replace('b','♭').replace('♯','#');
}
