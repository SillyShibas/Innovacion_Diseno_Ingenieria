const assert=require('node:assert/strict');
const {Game,reflections,GROUND}=require('../engine.js');
let count=0;
function test(name,run){run();count++;console.log('OK '+name);}
function playing(){const g=new Game();g.state='playing';return g;}
test('Cinco bloqueos y cinco reflexiones',()=>{const g=new Game();assert.equal(g.enemies.length,5);assert.equal(reflections.length,5);assert.equal(new Set(reflections.map(r=>r.name)).size,5);});
test('Movimiento y límites',()=>{const g=playing();g.tick(1/60,{right:true});assert(g.player.x>65);g.player.x=0;g.tick(1/60,{left:true});assert.equal(g.player.x,0);});
test('Salto y aterrizaje',()=>{const g=playing();g.jump();g.tick(1/60);assert(g.player.vy<0);assert(g.player.y<GROUND-g.player.h);for(let i=0;i<90;i++)g.tick(1/60);assert(g.player.grounded);assert.equal(g.player.y,GROUND-g.player.h);});
test('Aterrizaje sobre una plataforma',()=>{const g=playing();const s=g.platforms[0];g.player.x=s.x+10;g.player.y=s.y-g.player.h-2;g.player.vy=180;g.player.grounded=false;g.tick(1/60);assert.equal(g.player.y+g.player.h,s.y);assert(g.player.grounded);});
test('Pisotón crea un powerup y rebota',()=>{const g=playing();const e=g.enemies[0];g.player.x=e.x;g.player.y=e.y-g.player.h-1;g.player.vy=200;g.player.grounded=false;g.tick(1/60);assert(!e.alive);assert.equal(g.kills,1);assert.equal(g.pickups.length,1);assert(g.player.vy<0);assert.equal(g.state,'playing');g.defeat(e);assert.equal(g.kills,1);});
test('Golpe lateral pierde inmediatamente',()=>{const g=playing();g.player.x=g.enemies[0].x;g.tick(1/60);assert.equal(g.state,'lost');assert.equal(g.kills,0);});
test('Recoger pausa el juego y no duplica la reflexión',()=>{const g=playing();const e=g.enemies[0];g.defeat(e);g.events=[];g.player.x=e.x;g.tick(1/60);assert.equal(g.state,'reflection');assert(g.collected.has(0));const x=g.player.x;g.tick(1/30,{right:true});assert.equal(g.player.x,x);g.state='playing';g.tick(1/60);assert.equal(g.collected.size,1);assert.equal(g.events.filter(e=>e.type==='reflection').length,1);});
test('Victoria exactamente al vencer cinco enemigos',()=>{const g=playing();for(let i=0;i<4;i++)g.defeat(g.enemies[i]);assert(!g.won);g.defeat(g.enemies[4]);assert(g.won);assert.equal(g.kills,5);assert.equal(g.pickups.length,5);assert.equal(g.events.filter(e=>e.type==='win').length,1);});
test('Pausa e inicio congelan la simulación',()=>{const g=new Game();const x=g.player.x;g.tick(1/30,{right:true});assert.equal(g.player.x,x);g.state='paused';g.tick(1/30,{right:true});assert.equal(g.player.x,x);});
test('Reinicio limpia todo el progreso',()=>{const g=playing();g.defeat(g.enemies[0]);g.collected.add(0);g.reset();assert.equal(g.state,'start');assert.equal(g.kills,0);assert.equal(g.collected.size,0);assert.equal(g.pickups.length,0);assert(g.enemies.every(e=>e.alive));assert.equal(g.player.x,65);});
console.log(`${count} comprobaciones correctas.`);
