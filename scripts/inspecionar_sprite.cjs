// Mostra uma região da folha original em HTML, sem modificar o arquivo de imagem.
const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const input=path.resolve(process.argv[2]),offset=Number(process.argv[3]||0),name=process.argv[4]||'atlas';
 const session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_media.json','utf8').replace(/^\uFEFF/,''));
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),p=await b.newPage({viewport:{width:1150,height:950}});
 await p.goto('file:///'+input.replace(/\\/g,'/'));
 await p.evaluate(({offset})=>{const im=document.querySelector('img');document.body.style='margin:0;background:#f4f4f4';im.style=`position:absolute;left:60px;top:${40-offset}px;width:${im.naturalWidth}px;height:${im.naturalHeight}px;max-width:none;image-rendering:pixelated`;
   for(let y=0;y<950;y+=50){const e=document.createElement('div');e.textContent=offset+y;e.style=`position:fixed;left:0;top:${y+40}px;font:10px monospace;background:#fff9;z-index:2`;document.body.append(e)}
   for(let x=0;x<1100;x+=50){const e=document.createElement('div');e.textContent=x;e.style=`position:fixed;left:${x+60}px;top:0;font:10px monospace;background:#fff9;z-index:2`;document.body.append(e)}
 },{offset});
 await p.screenshot({path:path.join(session.child,name+'.png')});await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
