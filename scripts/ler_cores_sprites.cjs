// Mede a cor exibida pelo navegador, respeitando o perfil de cor de cada PNG.
// O canvas é usado apenas para leitura; nenhum arquivo de imagem é modificado.
const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const file='data/editorial/midias_jogos.json',media=JSON.parse(fs.readFileSync(file,'utf8'));
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage();
 for(const asset of media.sprites){
  asset.displayBackground=await page.evaluate(async src=>{
   const image=new Image();image.src=src;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
   const context=canvas.getContext('2d');context.drawImage(image,0,0,1,1,0,0,1,1);
   return [...context.getImageData(0,0,1,1).data].slice(0,3);
  },'data:image/png;base64,'+fs.readFileSync(asset.file).toString('base64'));
 }
 fs.writeFileSync(file,JSON.stringify(media,null,2));await browser.close();
 console.log(JSON.stringify({measured:media.sprites.length,imagesModified:0}));
})().catch(error=>{console.error(error);process.exit(1)});
