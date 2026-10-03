// Comprobación opcional de interfaz. Requiere Playwright y Microsoft Edge.
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Object.defineProperty(window,'CraftGame',{configurable:true,set(api){const Original=api.Game;api.Game=class extends Original{constructor(){super();window.testGame=this;}};Object.defineProperty(window,'CraftGame',{value:api,configurable:true});}});});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 await page.getByRole('button',{name:'¡Vamos a crear!'}).click();
 await page.keyboard.press('Space');await page.waitForFunction(()=>testGame.player.y<330);
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>testGame.state),'paused');
 await page.getByRole('button',{name:'Seguir creando'}).click();
 await page.evaluate(()=>{const g=testGame;g.player.x=g.enemies[0].x;g.player.y=415-g.player.h;g.player.vy=0;});
 await page.getByRole('heading',{name:'Fuiste victima del bloqueo creativo'}).waitFor();
 await page.getByRole('button',{name:'Volver al inicio',exact:true}).click();
 await page.getByRole('button',{name:'¡Vamos a crear!'}).click();
 await page.evaluate(()=>{const g=testGame,e=g.enemies[0];g.player.x=e.x;g.player.y=e.y-g.player.h-1;g.player.vy=200;g.player.grounded=false;g.tick(1/60);g.player.y=415-g.player.h;g.player.vy=0;});
 await page.getByRole('heading',{name:'Equivocarse también es avanzar'}).waitFor();
 await page.waitForFunction(()=>document.querySelector('.reflection-image').naturalWidth>0);
 assert.equal(await page.evaluate(()=>testGame.kills),1);
 await page.getByRole('button',{name:'Continuar →'}).click();
 await page.getByRole('button',{name:/Mis reflexiones/}).click();
 assert.equal(await page.locator('.gallery button:disabled').count(),4);
 await page.getByRole('button',{name:'Volver',exact:true}).click();
 await page.evaluate(()=>{testGame.enemies.forEach(e=>testGame.defeat(e));});
 await page.waitForFunction(()=>testGame.won);
 await page.locator('#pause-button').click();
 await page.getByRole('heading',{name:'¡Tu creatividad ganó!'}).waitFor();
 await page.getByRole('button',{name:'Ver las 5 reflexiones'}).click();
 assert.equal(await page.locator('.gallery button:not(:disabled)').count(),5);
 for(let id=0;id<5;id++){await page.locator(`[data-reflection="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('.reflection-image').naturalWidth>0);await page.getByRole('button',{name:'Volver a las reflexiones'}).click();}
 await page.getByRole('button',{name:'Volver',exact:true}).click();
 await page.getByRole('button',{name:'Jugar de nuevo'}).click();
 assert.equal(await page.evaluate(()=>testGame.kills),0);
 assert.equal(await page.locator('#toast.visible').count(),0);
 await page.screenshot({path:path.resolve(__dirname,'preview-desktop.png')});
 await page.setViewportSize({width:390,height:844});
 const control=await page.locator('[data-control="right"]').boundingBox();
 await page.mouse.move(control.x+control.width/2,control.y+control.height/2);
 await page.mouse.down();await page.waitForFunction(()=>testGame.player.x>80);await page.mouse.up();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Volver al inicio',exact:true}).click();
 assert.equal(await page.locator('#panel').evaluate(el=>el.scrollTop),0);
 await page.screenshot({path:path.resolve(__dirname,'preview-mobile.png')});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.getByRole('button',{name:'¡Vamos a crear!'}).click();
 assert.equal(await page.evaluate(()=>testGame.state),'playing');
 assert.deepEqual(errors,[]);
 console.log('OK navegador: salto, pausa, derrota, reinicio, powerup, imagen, galería, victoria, cinco reflexiones y diseño móvil. Sin errores JavaScript.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
