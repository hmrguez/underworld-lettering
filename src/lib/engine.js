import refs from './reference-paths.json' with { type:'json' };
import fallback from './fallback-paths.json' with { type:'json' };
import inferredRat from './inferred-rat-paths.json' with { type:'json' };
const fmt=n=>Math.round(n*100)/100;
const path=(d,transform='',extra='')=>`<path d="${d}" transform="${transform}" ${extra}/>`;
const group=(s,t)=>`<g transform="${t}">${s}</g>`;
export const styles=[{id:'rat',name:'Rat King',sample:'RAT KING',number:'01',description:'Angular brushwork · sweeping leg',accent:'#d9543c'},{id:'harrow',name:'Nurse Harrow',sample:'NURSE HARROW',number:'02',description:'Tall serifs · crossing strokes',accent:'#83a8a1'},{id:'baba',name:'Baba',sample:'BABA',number:'03',description:'Folk ornaments · patterned slabs',accent:'#95a25a'}];
function sourceGlyph(style,ch,row,alt){
  if(style==='rat'){
    const map={R:0,A:4,T:5,K:1,I:7,N:2,G:3};let p=refs.ratking[map[ch]];
    if(p){let advances={R:315,A:156,T:320,K:219,I:98,N:223,G:301};return {p,advance:advances[ch],x:p.x,y:0,scale:1,original:true};}
  } else if(style==='harrow'){
    const map={E:0,H:1,R:row?4:null,W:3,A:5,S:7,O:8};
    if(!row&&['N','U','R'].includes(ch)){let [x,w]=({N:[326,294],U:[620,308],R:[928,257]})[ch];return {p:refs.nurse[6],advance:w,x,y:0,scale:1,clip:{x,y:0,w,h:545},original:true};}
    let p=refs.nurse[map[ch]];
    if(p){let upper=!row;let s=upper?460/p.h:1;let adv=row?({H:304,A:317,R:312,O:285,W:508})[ch]:({S:188,E:257})[ch];return {p,advance:adv??p.w*s,x:p.x,y:upper?-p.y*s+7:0,scale:s,original:true};}
  } else if(style==='baba'&&['A','B'].includes(ch)){
    let p=refs.baba[ch==='B'?(alt?1:0):(alt?22:2)];return {p,advance:ch==='B'?155:154,x:p.x,y:0,scale:1,original:true};
  }
  if(style==='rat'&&inferredRat[ch]){const p=inferredRat[ch];return {p,advance:p.advance,x:p.x,y:310,scale:1,original:false};}
  const p=fallback[style][ch];if(!p)return null;
  let height=style==='rat'?490:style==='harrow'?row?574:460:127;
  const scale=height/p.h,advance=p.w*scale*(style==='harrow'?.70:1)+ (style==='baba'?22:25);
  return {p,advance,x:p.x,y:-p.y*scale+(style==='rat'?310:style==='harrow'?row?540:7:52),scale,scaleX:style==='harrow'?.70:1,original:false};
}
function setting(g,overrides,key){return overrides[g.id]?.[key]??g.modifiers[key]??'auto';}
function enabled(g,overrides,key,global){const v=setting(g,overrides,key);return v==='auto'?global:!['off','base'].includes(v);}
export function render(ast,options={}){
  const o={style:'rat',crown:true,swash:true,ornaments:true,texture:true,irregular:true,tracking:0,swashLength:1,color:'#eee6d1',overrides:{},...options};
  const color=/^#[\da-f]{6}$/i.test(o.color)?o.color:'#eee6d1';let defs='',body='',applied=[],inferred=[],hits=[],maxW=0;
  const isH=o.style==='harrow',isB=o.style==='baba';let rows=isH&&ast.words.length>1?[ast.words.slice(0,1),ast.words.slice(1)]:[ast.words];
  let layouts=rows.map((words,row)=>{let x=0,items=[];for(let w of words){let start=x;for(let g of w.glyphs){let alt=setting(g,o.overrides,'variant')==='alt'||(setting(g,o.overrides,'variant')==='auto'&&isB&&g.id>1);let asset=sourceGlyph(o.style,g.char,row,alt);if(asset){items.push({g,a:asset,x,row,wordStart:start});x+=asset.advance+Number(o.tracking)*(isB?.22:1);}} x+=isB?60:isH?85:15;}return {items,width:Math.max(1,x-(isB?60:isH?85:15)-Number(o.tracking)*(isB?.22:1))};});
  maxW=Math.max(1,...layouts.map(l=>l.width));const firstWidth=layouts[0]?.items.filter(i=>i.g.word===0).reduce((n,i)=>n+i.a.advance+Number(o.tracking)*(isB?.22:1),0)||0;
  const height=isB?220:isH?(rows.length>1?1170:610):990;
  for(let layout of layouts){let offset=(maxW-layout.width)/2-(isH&&rows.length>1&&layout===layouts[0]?42:0);
    for(let {g,a,x,row,wordStart} of layout.items){x+=offset;let id=`glyph-${g.id}`,s=a.scale,tx=-a.x*(a.scaleX??1)*s,ty=a.y;let shape='';
      if(a.clip){defs+=`<clipPath id="clip-${id}"><rect x="${a.clip.x}" y="${a.clip.y}" width="${a.clip.w}" height="${a.clip.h}"/></clipPath>`;shape=path(a.p.d,'',`clip-path="url(#clip-${id})"`);}
      else shape=path(a.p.d);
      shape=group(shape,`translate(${fmt(tx)} ${fmt(ty)}) scale(${fmt(s*(a.scaleX??1))} ${fmt(s)})`);
      if(o.style==='rat'&&g.char==='R'){
        let word=ast.words[g.word];let use=enabled(g,o.overrides,'swash',o.swash&&word.glyphs[0].id===g.id&&word.glyphs.length<=6);
        defs+=`<clipPath id="rbase-${id}"><rect x="-5" y="0" width="320" height="990"/></clipPath><clipPath id="rtail-${id}"><rect x="315" y="0" width="700" height="990"/></clipPath>`;
        const base=group(shape,`translate(0 0)`);shape=`<g clip-path="url(#rbase-${id})">${base}</g>`;
        if(use){let ww=layout.items.filter(i=>i.g.word===g.word).reduce((n,i)=>n+i.a.advance+Number(o.tracking),0);let stretch=Math.min(2.8,Math.max(.15,(ww*1.23-315)/657))*Number(o.swashLength);shape+=group(`<g clip-path="url(#rtail-${id})">${base}</g>`,`translate(315 0) scale(${fmt(stretch)} 1) translate(-315 0)`);maxW=Math.max(maxW,x+315+657*stretch);applied.push({glyph:g.id,label:'R leg → word width'});}
      }
      if(!o.irregular&&o.style==='rat'&&a.original){shape=group(shape,`translate(0 ${310-a.p.y})`);}
      let glyphBody=shape;
      const dot=setting(g,o.overrides,'dot');if(g.char==='I'&&dot!=='off'&&dot!=='auto'){
        const cx=a.advance*.5,cy=isB?24:220;let mark=dot==='star'?`M${cx} ${cy-35}l9 23 25 2-19 16 6 24-21-14-21 14 6-24-19-16 25-2Z`:`M${cx-34} ${cy+12}l-8-45 26 24 16-39 14 38 27-22-9 44Z`;
        glyphBody+=path(mark);applied.push({glyph:g.id,label:`I dot → ${dot==='star'?'star':'crown'}`});
      }
      if(isB&&enabled(g,o.overrides,'ornament',o.ornaments)&&!a.original){let cx=a.advance*.5;glyphBody+=`<path d="M${cx} 72q-12 10 0 21q12-11 0-21M${cx} 120l-7 10 7 10 7-10Z" fill="#20221c"/>`;}
      let rot=setting(g,o.overrides,'variant')==='alt'&&!isB?(g.id%2?3:-3):0;
      body+=`<g data-glyph="${g.id}" role="button" tabindex="0" aria-label="Select letter ${g.char}, position ${g.id+1}" transform="translate(${fmt(x)} 0) rotate(${rot} ${fmt(a.advance/2)} ${isB?120:600})">${glyphBody}</g>`;
      hits.push({id:g.id,char:g.char,x,w:a.advance,original:a.original});if(!a.original)inferred.push(g.char);
    }
  }
  if(o.style==='rat'&&o.crown&&ast.glyphs.length&& !ast.glyphs.some(g=>g.char==='I'&&['crown','star'].includes(setting(g,o.overrides,'dot')))){let p=refs.ratking[6];body+=path(p.d,`translate(${fmt(firstWidth*.823-p.x-p.w/2)} 0)`);applied.push({label:'Crown → first word'});}
  if(isH){let r=layouts[0].items.find(i=>i.g.char==='R'&&enabled(i.g,o.overrides,'swash',o.swash));if(r){let x=r.x+(maxW-layouts[0].width)/2-928;body+=group(path(refs.nurse[9].d)+path(refs.nurse[10].d),`translate(${fmt(x)} 0)`);applied.push({glyph:r.g.id,label:'R flourish → lower line'});}}
  if(isB&&o.ornaments&&ast.glyphs.length){const parts=[3,14,15,16,17,18,19,20,24];let crown=parts.map(i=>path(refs.baba[i].d)).join('');body+=group(crown,`translate(${fmt(maxW/2-318)} 0)`);let ornaments=[4,5,8,12].map(i=>path(refs.baba[i].d)).join('');body+=group(ornaments,'translate(-34 0)');body+=group(ornaments,`translate(${fmt(maxW+34)} 0) scale(-1 1)`);applied.push({label:'Folk crown + side ornaments'});}
  if(o.texture&&o.style==='rat'){
    defs+='<filter id="ink-grain" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".052" numOctaves="2" seed="8" result="noise"/><feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.2 -.15"/><feComposite in="SourceGraphic" operator="out"/></filter>';applied.push({label:'Ink grain'});
  }
  const margin=isB?65:85,w=fmt(maxW+margin*2),h=height+margin*2;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${w} ${h}" role="img" aria-label="${styles.find(s=>s.id===o.style)?.name||'Lettering'} preview" fill="${color}"><defs>${defs}</defs><g ${o.texture&&o.style==='rat'?'filter="url(#ink-grain)"':''}>${body}</g></svg>`;
  return {svg,width:w,height:h,hits,applied,inferred:[...new Set(inferred)],empty:!ast.glyphs.length};
}
