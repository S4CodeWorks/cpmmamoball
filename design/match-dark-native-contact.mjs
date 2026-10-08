import fs from 'node:fs';
import sharp from 'sharp';
const dir='design/match-dark-previews';
const meta=JSON.parse(fs.readFileSync('design/match-dark-metadata.json'));
const all=[...meta.scenes,...meta.states,...meta.prototypes];
for(let start=0;start<all.length;start+=8){
 const list=all.slice(start,start+8),tiles=[];
 for(let i=0;i<list.length;i++){
  const s=list[i],path=dir+'/'+s.root.replace(':','-')+'.png';
  const png=await sharp(fs.readFileSync(path)).resize({width:310,height:530,fit:'inside'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  tiles.push({input:png.data,raw:{width:png.info.width,height:png.info.height,channels:png.info.channels},left:(i%4)*320,top:Math.floor(i/4)*570+32});
  const title=[s.name||s.state||s.kind,s.width,s.root].join(' · ');
  tiles.push({input:Buffer.from('<svg width="320" height="28"><rect width="320" height="28" fill="#eee"/><text x="4" y="18" font-size="11">'+title+'</text></svg>'),left:(i%4)*320,top:Math.floor(i/4)*570});
 }
 await sharp({create:{width:1280,height:Math.ceil(list.length/4)*570,channels:3,background:'#dce0e5'}}).composite(tiles).png().toFile(dir+'/contact-'+start/8+'.png');
}
