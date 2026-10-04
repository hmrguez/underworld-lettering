export const MODIFIERS = { swash: ['auto','word','off'], dot: ['auto','crown','star','off'], variant: ['auto','base','alt'], ornament: ['auto','on','off'] };
export function lex(source) {
  const tokens=[]; let i=0;
  while(i<source.length){const start=i,c=source[i];
    if (/\s/.test(c)){while(i<source.length&&/\s/.test(source[i]))i++;tokens.push({type:'space',value:source.slice(start,i),start,end:i});}
    else if(/[A-Za-z0-9'-]/.test(c)){tokens.push({type:'glyph',value:c.toUpperCase(),start,end:++i});}
    else if(c==='['){i++;while(i<source.length&&source[i]!==']')i++;const closed=source[i]===']';if(closed)i++;tokens.push({type:'modifier',value:source.slice(start+1,closed?i-1:i),closed,start,end:i});}
    else tokens.push({type:'invalid',value:c,start,end:++i});
  } return tokens;
}
export function parse(source){
  const tokens=lex(source),glyphs=[],words=[],errors=[];let word=null,last=null;
  for(const token of tokens){
    if(token.type==='glyph'){
      if(glyphs.length>=24){if(!errors.some(e=>e.message.includes('24')))errors.push({start:token.start,message:'Use at most 24 letters or digits.'});continue;}
      if(!word){word={index:words.length,glyphs:[]};words.push(word);}
      last={id:glyphs.length,char:token.value,start:token.start,end:token.end,word:word.index,modifiers:{}};glyphs.push(last);word.glyphs.push(last);
    } else if(token.type==='space'){word=null;last=null;}
    else if(token.type==='modifier'){
      if(!token.closed)errors.push({start:token.start,message:'Close the modifier with ].'});
      if(!last){errors.push({start:token.start,message:'Place a modifier immediately after a letter.'});continue;}
      for(const field of token.value.split(',')){const [key,value,...extra]=field.split('=').map(s=>s.trim());if(!MODIFIERS[key]||!MODIFIERS[key].includes(value)||extra.length)errors.push({start:token.start,message:`Unknown setting: ${field}.`});else last.modifiers[key]=value;}
    } else errors.push({start:token.start,message:`Unsupported character: ${token.value}. Use A–Z, digits, spaces, hyphens or apostrophes.`});
  }
  return {type:'Name',tokens,words,glyphs,errors};
}
