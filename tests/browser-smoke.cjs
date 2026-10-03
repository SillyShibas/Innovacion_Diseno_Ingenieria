// Revisión breve de interfaz. Requiere Playwright y Microsoft Edge.
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 await page.addInitScript(()=>{Object.defineProperty(window,'CraftGame',{configurable:true,set(api){const Original=api.Game;api.Game=class extends Original{constructor(){super();window.testGame=this;}};Object.defineProperty(window,'CraftGame',{value:api,configurable:true});}});});
 const snap=name=>page.screenshot({path:path.resolve(__dirname,name),fullPage:true});
 const layout=async()=>{
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('#panel').evaluate(p=>p.scrollWidth<=p.clientWidth+1));
  assert(await page.locator('h1').evaluate(p=>p.scrollWidth<=p.clientWidth+1));
 };
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 assert.equal(await page.locator('.brand').innerText(),'✳ Taller En Énfasis 1');
 assert.equal(await page.title(),'Escuchar para iterar: Como afecta la iteración al diseño en ingeniería.');
 await layout();await snap('preview-desktop.png');
 assert((await page.locator('#panel').innerText()).includes('Ayuda a CaseroBot a aprender que significa diseñar, perseverar e iterar sin que sea victima de los bloqueos creativos.'));
 assert(!(await page.locator('#panel').innerText()).toLowerCase().includes('dash'));
 await page.getByRole('button',{name:'¡Vamos a crear!'}).click();
 await snap('gameplay-desktop.png');
 await page.keyboard.press('Space');await page.waitForFunction(()=>testGame.player.y<330);
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>testGame.state),'paused');await page.getByRole('button',{name:'Seguir creando'}).click();
 await page.evaluate(()=>{const g=testGame;g.player.x=g.enemies[0].x;g.player.y=415-g.player.h;g.player.vy=0;});
 await page.locator('#death-title').waitFor();assert.equal(await page.locator('#death-title').innerText(),await page.evaluate(()=>testGame.deathMessage));
 await page.getByRole('button',{name:'Volver al inicio',exact:true}).click();await page.getByRole('button',{name:'¡Vamos a crear!'}).click();
 await page.evaluate(()=>{const g=testGame,e=g.enemies[0];e.cooldown=99;g.player.x=e.x;g.player.y=e.y-g.player.h-1;g.player.vy=200;g.player.grounded=false;g.tick(1/60);g.player.x=g.pickups[0].x;g.player.y=g.pickups[0].y;g.player.vy=0;});
 await page.getByRole('heading',{name:'LA PERSEVERANCIA ES LA CLAVE DEL ÉXITO',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.reflection-image').naturalWidth>0);
 await layout();await snap('reflection-desktop.png');assert.equal(await page.evaluate(()=>testGame.kills),1);
 await page.getByRole('button',{name:'Continuar →'}).click();await page.getByRole('button',{name:/Mis reflexiones/}).click();assert.equal(await page.locator('.gallery button:disabled').count(),4);await page.getByRole('button',{name:'Volver',exact:true}).click();
 await page.evaluate(()=>testGame.enemies.forEach(e=>testGame.defeat(e)));await page.waitForFunction(()=>testGame.won);await page.locator('#pause-button').click();await page.getByRole('heading',{name:'¡Aprendiste a iterar!'}).waitFor();await snap('victory-desktop.png');
 await page.getByRole('button',{name:'Ver las 5 reflexiones'}).click();assert.equal(await page.locator('.gallery button:not(:disabled)').count(),5);
 for(let id=0;id<5;id++){await page.locator(`[data-reflection="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('.reflection-image').naturalWidth>0);await layout();assert.equal(await page.locator('.reflection-image').evaluate(el=>getComputedStyle(el).objectFit),'contain');await page.getByRole('button',{name:'Volver a las reflexiones'}).click();}
 await page.getByRole('button',{name:'Volver',exact:true}).click();await page.getByRole('button',{name:'Jugar de nuevo'}).click();assert.equal(await page.evaluate(()=>testGame.kills),0);assert.equal(await page.locator('#toast.visible').count(),0);
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Volver al inicio',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await layout();assert.equal(await page.locator('#panel').evaluate(p=>p.scrollTop),0);await snap('preview-mobile.png');
 await page.getByRole('button',{name:'¡Vamos a crear!'}).click();await snap('gameplay-mobile.png');
 await page.locator('[data-control="right"]').scrollIntoViewIfNeeded();const control=await page.locator('[data-control="right"]').boundingBox();await page.mouse.move(control.x+control.width/2,control.y+control.height/2);await page.mouse.down();await page.waitForFunction(()=>testGame.player.x>80);await page.mouse.up();
 // Las mensajes de derrota según la causa utilizan exactamente la misma pantalla.
 for(const cause of ['enemy','spikes','pit']){
  await page.evaluate(cause=>{const g=testGame;g.enemies.forEach(e=>e.alive=cause==='enemy');if(cause==='enemy'){g.player.x=g.enemies[0].x;g.player.y=415-g.player.h;}else if(cause==='spikes'){g.player.x=g.spikes[0].x;g.player.y=g.spikes[0].y-g.player.h+2;}else{g.player.x=g.pits[0].x+45;g.player.y=610;}g.player.vy=0;},cause);
  await page.locator('#death-title').waitFor();assert.equal(await page.locator('#death-title').innerText(),await page.evaluate(()=>testGame.deathMessage));await layout();await page.getByRole('button',{name:'Volver al inicio',exact:true}).click();await page.getByRole('button',{name:'¡Vamos a crear!'}).click();
 }
 await page.evaluate(()=>testGame.enemies.forEach(e=>testGame.defeat(e)));await page.waitForFunction(()=>testGame.won);await page.locator('#pause-button').click();await page.getByRole('button',{name:'Ver las 5 reflexiones'}).click();
 for(let id=0;id<5;id++){await page.locator(`[data-reflection="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('.reflection-image').naturalWidth>0);await layout();await snap(`reflection-${id+1}-mobile.png`);await page.getByRole('button',{name:'Volver a las reflexiones'}).click();}
 await page.getByRole('button',{name:'Volver',exact:true}).click();await snap('victory-mobile.png');
 await page.setViewportSize({width:320,height:740});await page.getByRole('button',{name:'Ver las 5 reflexiones'}).click();await layout();await page.locator('[data-reflection="3"]').click();await layout();
 await page.getByRole('button',{name:'Volver a las reflexiones'}).click();await page.getByRole('button',{name:'Volver',exact:true}).click();await page.getByRole('button',{name:'Jugar de nuevo'}).click();
 const signsBefore=await page.evaluate(()=>JSON.stringify(testGame.signs));
 for(const viewport of [{width:1280,height:1100,label:'desktop'},{width:390,height:844,label:'mobile'}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>{const g=testGame;g.state='paused';g.player.x=g.pits[0].x-230;g.player.y=415-g.player.h;});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await snap(`signs-${viewport.label}.png`);
  await page.evaluate(()=>{testGame.player.x=testGame.pits[0].x+testGame.pits[0].w+650;});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await snap(`after-pit-${viewport.label}.png`);
  assert.equal(await page.evaluate(()=>JSON.stringify(testGame.signs)),signsBefore);
 }
 for(const viewport of [{width:1280,height:1100,label:'desktop'},{width:390,height:844,label:'mobile'}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>{const green=testGame.enemies.find(e=>e.kind==='main'&&e.id===4);testGame.player.x=green.spawn+100;testGame.player.y=415-testGame.player.h;});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await snap(`colors-${viewport.label}.png`);
 }
 await page.evaluate(()=>{const g=testGame,e=g.enemies[0];g.enemies.forEach(other=>other.alive=other===e);g.spikes=[];g.state='playing';g.won=false;e.x=620;e.y=415-e.h;e.grounded=true;e.support=0;e.mode='attack';e.timer=.33;e.dir=-1;e.attackShownAt=null;g.player.x=560;g.player.y=415-g.player.h;g.player.vy=0;});
 await page.waitForFunction(()=>testGame.enemies[0].attackShownAt!=null);assert.equal(await page.evaluate(()=>testGame.state),'playing');
 await page.waitForFunction(()=>testGame.state==='lost');assert(await page.evaluate(()=>testGame.time-testGame.enemies[0].attackShownAt>=.15-1e-9));
 assert.deepEqual(errors,[]);console.log('OK Edge: reglas, salto, pausa, mensajes de derrota según la causa, powerup, cinco imágenes, galería, victoria, reinicio, controles táctiles y diseño a 1280, 390 y 320 px. Carteles antes y después del pozo y capturas actualizadas en tests. Sin errores JavaScript.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
