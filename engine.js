(function(scope){
'use strict';
const GROUND=415,WORLD=6400;
const reflections=scope.DesignReflections||(typeof require==='function'?require('./reflections.js'):[]);
const DASH_SPEED=680,DASH_DURATION=.5;
const DASH_COOLDOWN=6,DASH_RANGE=[180,DASH_SPEED*DASH_DURATION-20],ATTACK_RANGE=75;
const ATTACK_DAMAGE_DELAY=.05;
const LOW_JUMP=-560,HIGH_JUMP=-740,DETECTION_RANGE=1200;
const BLOCK_CAUSES={
 culturales:[
  'conformarte con un patrón aceptado en lugar de explorar alternativas',
  'priorizar lo práctico y económico antes de comprender el problema',
  "evitar cuestionar por creer que preguntar demasiado es 'tonto' o 'poco educado'",
  'dar demasiada importancia a competir o cooperar y perder de vista el problema',
  'confiar demasiado en las estadísticas sin cuestionar lo que muestran',
  'convertir generalizaciones en prejuicios que limitan tus ideas',
  'separar el trabajo del juego y descartar la exploración lúdica',
  "pensar en términos de 'todo o nada' y descartar soluciones intermedias",
  'creer que dar rienda suelta a la imaginación es perder el tiempo'
 ],
 emocionales:[
  'tener miedo de equivocarte o parecer tonto',
  'quedarte con la primera idea viable en lugar de buscar una mejor',
  'aferrarte a una opinión sesgada y resistirte a cambiarla',
  'querer tener éxito inmediato sin dar tiempo al proceso',
  'buscar únicamente lo seguro y evitar cualquier riesgo',
  'temer a tus supervisores y desconfiar de las personas con las que trabajas',
  'perder el impulso para desarrollar el problema hasta terminarlo',
  'seguir las normas con tanta rigidez que rechazas otros caminos válidos'
 ],
 perceptuales:[
  'no lograr aislar el problema que necesitas resolver',
  'simplificar demasiado el problema y dejar de prestar atención al contexto',
  'no definir los términos ni distinguir los atributos del problema',
  'observar sin aprovechar todos tus sentidos',
  'no detectar las relaciones y conexiones entre causas y efectos',
  'pasar por alto lo obvio al observar el problema',
  'basarte en similitudes superficiales y dar demasiado peso a tu experiencia',
  'aplicar conceptos de otra disciplina sin comprobar si funcionan en este contexto'
 ]
};
const CATEGORY_NAMES={culturales:'cultural',emocionales:'emocional',perceptuales:'perceptual'};
const BLOCKS=Object.fromEntries(Object.entries(BLOCK_CAUSES).map(([category,causes])=>[category,causes.map(cause=>`un bloqueo creativo ${CATEGORY_NAMES[category]} por ${cause}`)]));
const MAIN_COLORS=['#ef5348','#9955e8','#f3ac18','#1daece','#14bd68'];

const randomItem=(list,rng)=>list[Math.min(list.length-1,Math.floor(rng()*list.length))];
class Game{
 constructor(rng=Math.random){this.rng=rng;this.reset();}
 reset(){
  this.pits=[{x:1500,w:140,label:'culturales',type:'cultural'},{x:3100,w:145,label:'emocionales',type:'emocional'},{x:4700,w:150,label:'perceptuales',type:'perceptual'}];
  this.signs=this.pits.map(p=>({x:p.x-205,y:GROUND-115,w:180,h:58,label:p.label}));
  this.surfaces=[];let left=0;this.pits.forEach(p=>{this.surfaces.push({x:left,y:GROUND,w:p.x-left,h:85,ground:true});left=p.x+p.w;});this.surfaces.push({x:left,y:GROUND,w:WORLD-left,h:85,ground:true});
  this.platforms=[];this.spikes=[];
  for(const land of this.surfaces){
   const layouts=[{dx:230,y:325,w:200},{dx:450,y:280,w:220},{dx:700,y:325,w:210},{dx:970,y:300,w:230}];
   for(const l of layouts)if(l.dx+l.w<land.w-240)this.platforms.push({x:land.x+l.dx,y:l.y,w:l.w,h:16});
  }
  this.platforms.forEach(platform=>{
   const count=2+Math.min(2,Math.floor(this.rng()*3)),w=count*13;
   let offset=12+this.rng()*(platform.w-w-24);
   // Conservar al menos una zona de aterrizaje y aparición segura.
   if(Math.max(offset,platform.w-offset-w)<76)offset=this.rng()<.5?platform.w-w-76:76;
   this.spikes.push({x:platform.x+offset,y:platform.y-18,w,h:18,count});
  });
  this.surfaces.push(...this.platforms);this.surfaces.forEach((s,i)=>s.id=i);
  this.graph=this.surfaces.map(a=>this.surfaces.filter(b=>a!==b&&a.y-b.y<=180&&this.gap(a,b)<=110).map(b=>b.id));
  this.player={x:65,y:GROUND-76,w:45,h:76,vx:0,vy:0,grounded:true,facing:1,support:0,feetTimer:0};
  const positions=[1200,2800,3550,4400,5500],categories=['culturales','emocionales','emocionales','perceptuales','perceptuales'];
  this.enemies=positions.map((x,i)=>this.makeEnemy(i,x,'main',categories[i]));
  this.greyCounts=[];
  for(const land of this.surfaces.filter(s=>s.ground)){
   const originalCount=4+Math.min(2,Math.floor(this.rng()*3));
   const count=originalCount-(originalCount===6?2:1);this.greyCounts.push(count);
   for(let j=0;j<count;j++){
    let x=land.x+300+j*(land.w-650)/(count-1)+(this.rng()-.5)*24;
    x=this.safeGroundX(x,land,48);for(const e of this.enemies)if(Math.abs(x-e.spawn)<95)x=this.safeGroundX(x-115,land,48);
    this.enemies.push(this.makeEnemy(this.enemies.length,x,'grey',null));
   }
  }
  for(const platform of this.platforms){
   if(this.rng()>=.6)continue;
   const center=this.safeAim(platform,platform.x+platform.w*this.rng());if(center==null)continue;
   const e=this.makeEnemy(this.enemies.length,center-24,'grey',null);
   e.y=platform.y-e.h;e.spawnY=e.y;e.support=platform.id;e.spawnSupport=platform.id;
   e.min=platform.x+6;e.max=platform.x+platform.w-e.w-6;
   this.enemies.push(e);
  }
  this.pickups=[];this.collected=new Set();this.kills=0;this.greyKills=0;this.won=false;this.state='start';this.time=0;this.jumpBuffer=0;this.coyote=.1;this.events=[];this.deathMessage='';this.fallPit=null;
 }
 makeEnemy(id,x,kind,category){const land=this.groundAt(x+24);return{id,kind,category,blockName:category?randomItem(BLOCKS[category],this.rng):null,color:kind==='grey'?'#a1a5a1':MAIN_COLORS[id],x,y:GROUND-48,w:48,h:48,vx:0,vy:0,grounded:true,support:land.id,dir:1,alive:true,active:false,mode:'idle',timer:0,cooldown:.3+id*.1,attackCooldown:0,jumpCooldown:0,attackFromDash:false,dashDir:1,trail:[],spawn:x,min:Math.max(land.x+65,x-95),max:Math.min(land.x+land.w-100,x+95),hopTimer:this.rng()*1.5,routeTarget:null,dropSurface:null};}
 gap(a,b){return Math.max(0,a.x-b.x-b.w,b.x-a.x-a.w);}
 overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
 groundAt(x){return this.surfaces.find(s=>s.ground&&x>=s.x&&x<=s.x+s.w);}
 surfaceBelow(x,y){return this.surfaces.filter(s=>x>=s.x&&x<=s.x+s.w&&s.y>=y-2).sort((a,b)=>a.y-b.y)[0]||null;}
 safeGroundX(x,land,w){x=Math.max(land.x+80,Math.min(land.x+land.w-w-100,x));for(const s of this.spikes)if(s.y+s.h===GROUND&&x+w>s.x-10&&x<s.x+s.w+10)x=s.x-w-20;return x;}
 safeAt(x,y,w=48,h=48){return !this.spikes.some(s=>this.overlap({x,y:y-h,w,h},s));}
 safeAim(s,desired,w=48){const lo=s.x+w/2+6,hi=s.x+s.w-w/2-6;let candidates=[Math.max(lo,Math.min(hi,desired)),lo,hi];for(const spike of this.spikes)if(Math.abs(spike.y+spike.h-s.y)<1)candidates.push(spike.x-w/2-8,spike.x+spike.w+w/2+8);return candidates.filter(x=>x>=lo&&x<=hi&&this.safeAt(x-w/2,s.y,w)).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0]??null;}
 jump(){if(this.state==='playing')this.jumpBuffer=.15;}
 lose(message){if(this.won||this.state==='lost')return;this.state='lost';this.deathMessage=message;this.events.push({type:'lose'});}
 move(body,dt){
  const oldTop=body.y,oldBottom=body.y+body.h;body.lastSupport=body.support;body.x=Math.max(0,Math.min(WORLD-body.w,body.x+body.vx*dt));body.vy+=1450*dt;body.y+=body.vy*dt;body.grounded=false;body.support=null;let landing=null;
  // Bajo los pinchos, el tablero bloquea la cabeza antes de alcanzar el peligro.
  // Las partes libres conservan el salto a través de la plataforma.
  if(body.vy<0){
   let ceiling=null;
   for(const s of this.platforms){
    const underside=s.y+s.h;
    if(oldTop>=s.y-.3&&body.y<underside&&this.spikes.some(spike=>Math.abs(spike.y+spike.h-s.y)<.1&&body.x<spike.x+spike.w&&body.x+body.w>spike.x)&&(!ceiling||underside>ceiling.y+ceiling.h))ceiling=s;
   }
   if(ceiling){body.y=ceiling.y+ceiling.h;body.vy=0;body.routeTarget=null;}
  }
  for(const s of this.surfaces)if(s.id!==body.dropSurface&&body.vy>=0&&oldBottom<=s.y+.3&&body.y+body.h>=s.y&&body.x+body.w-5>s.x&&body.x+5<s.x+s.w&&(!landing||s.y<landing.y)&&this.platformAvailable(body,s))landing=s;
  if(landing){body.y=landing.y-body.h;body.vy=0;body.grounded=true;body.support=landing.id;body.routeTarget=null;body.dropSurface=null;}
 }
 route(from,to){if(from===to||from==null||to==null)return null;const queue=[[from]],seen=new Set([from]);while(queue.length){const path=queue.shift();for(const next of this.graph[path.at(-1)]||[]){if(seen.has(next))continue;const p=[...path,next];if(next===to)return this.surfaces[p[1]];seen.add(next);queue.push(p);}}return null;}
 jumpVelocity(e,s){return e.kind==='grey'||e.y+e.h-s.y<=105?LOW_JUMP:HIGH_JUMP;}
 platformAvailable(e,s){return e.kind!=='grey'||s.ground||!this.enemies.some(other=>other!==e&&other.alive&&other.kind==='grey'&&((other.grounded&&other.support===s.id)||other.routeTarget?.id===s.id)&&!((e.support===s.id||e.lastSupport===s.id)&&other.id>e.id));}
 startJump(e,s,aim,velocity=this.jumpVelocity(e,s)){
  if((e.kind==='grey'&&e.jumpCooldown>0)||aim==null||!this.platformAvailable(e,s)||aim<s.x+e.w/2+6||aim>s.x+s.w-e.w/2-6)return false;const rise=e.y+e.h-s.y,discriminant=velocity*velocity-2*1450*rise;if(discriminant<0)return false;const time=(-velocity+Math.sqrt(discriminant))/1450,dx=aim-(e.x+e.w/2);
  if(time<=0||Math.abs(dx)>time*205||!this.safeAt(aim-e.w/2,s.y))return false;
  if(e.kind==='main'&&Math.abs(aim-this.player.x-this.player.w/2)<70&&Math.abs(s.y-this.player.y-this.player.h)<50)return false;
  // Comprobar la trayectoria completa, no solo el punto de aterrizaje.
  const vx=dx/time;for(let t=.025;t<time;t+=.025){const b={x:e.x+vx*t,y:e.y+velocity*t+725*t*t,w:e.w,h:e.h};if(this.spikes.some(spike=>this.overlap(b,spike)))return false;}
  e.vy=velocity;e.vx=vx;e.jumpVx=vx;e.grounded=false;e.routeTarget=s;e.dropSurface=null;if(e.kind==='grey'){e.jumpCooldown=1.5;e.hopTimer=1.5;}return true;
 }
 startDrop(e){
  const from=this.surfaces[e.support];if(!e.grounded||!from||from.ground)return false;
  const below=this.surfaceBelow(e.x+e.w/2,from.y+3);if(!below||!this.platformAvailable(e,below)||!this.safeAt(e.x,below.y))return false;
  e.dropSurface=from.id;e.routeTarget=below;e.grounded=false;e.vy=60;e.vx=0;e.jumpVx=0;return true;
 }
 safeStep(e,dir,distance){const x=e.x+dir*distance,center=x+e.w/2,s=this.surfaceBelow(center,e.y+e.h);return !!s&&s.y<=GROUND&&this.safeAt(x,s.y)&&(!this.pits.some(p=>center>p.x&&center<p.x+p.w));}
 safeDash(e,dir,distance){
  const surface=this.surfaces[e.support];if(!e.grounded||!surface)return false;
  const x=e.x+dir*distance;if(x<surface.x+8||x+e.w>surface.x+surface.w-8)return false;
  const swept={x:Math.min(x,e.x),y:e.y,w:e.w+Math.abs(x-e.x),h:e.h};
  return !this.spikes.some(spike=>this.overlap(swept,spike));
 }
 jumpObstacle(e,dir){
  if(!e.grounded||!dir)return false;
  const danger=this.spikes.find(s=>Math.abs(s.y+s.h-e.y-e.h)<2&&((dir>0&&s.x>=e.x+e.w&&s.x-e.x-e.w<55)||(dir<0&&s.x+s.w<=e.x&&e.x-s.x-s.w<55)));
  if(!danger)return false;
  const surface=this.surfaces[e.support],aim=dir>0?danger.x+danger.w+e.w/2+8:danger.x-e.w/2-8;
  if(surface&&this.startJump(e,surface,aim))return true;
  // Si el otro lado no tiene espacio, buscar un aterrizaje seguro más abajo.
  if(surface&&!surface.ground){const exit=dir>0?surface.x+surface.w+e.w/2+8:surface.x-e.w/2-8;const below=this.surfaceBelow(exit,surface.y+3);if(below&&this.startJump(e,below,exit))return true;}
  return false;
 }
 pursue(e){
  if(!e.grounded){e.vx=e.jumpVx??e.vx;return;}
  const p=this.player,pc=p.x+p.w/2,ec=e.x+e.w/2,side=ec>=pc?1:-1;
  const target=p.support??this.surfaceBelow(pc,p.y+p.h)?.id,next=this.route(e.support,target);
  let desired=pc+side*85;
  if(next){if(next.ground&&this.startDrop(e))return;const aim=this.safeAim(next,desired);if(aim!=null&&Math.abs(aim-ec)<220&&this.startJump(e,next,aim))return;if(aim!=null)desired=aim;}
  const dx=desired-ec;e.dir=Math.sign(pc-ec)||e.dir;e.vx=Math.abs(dx)>9?Math.sign(dx)*95:0;
  const travelDir=Math.sign(e.vx);if(!travelDir)return;
  if(this.jumpObstacle(e,travelDir))return;
  if(!this.safeStep(e,travelDir,40))e.vx=0;
 }
 patrol(e,dt){
  e.hopTimer-=dt;if(!e.grounded){e.vx=e.jumpVx??0;return;}
  const surface=this.surfaces[e.support];
  if(e.kind==='grey'&&surface&&!surface.ground){
   const crowded=this.enemies.some(other=>other!==e&&other.alive&&other.kind==='grey'&&other.grounded&&other.support===e.support&&other.id<e.id);
   if(crowded&&this.startDrop(e))return;
   e.min=surface.x+6;e.max=surface.x+surface.w-e.w-6;
  }else if(surface?.ground){e.min=surface.x+65;e.max=surface.x+surface.w-100;}
  if(e.x<=e.min)e.dir=1;if(e.x>=e.max)e.dir=-1;
  if(this.jumpObstacle(e,e.dir))return;
  if(!this.safeStep(e,e.dir,30))e.dir*=-1;
  e.vx=e.dir*(e.kind==='grey'?38:25);if(!this.safeStep(e,e.dir,20))e.vx=0;
  if(e.kind==='grey'&&e.hopTimer<=0){
   e.hopTimer=.5;const center=e.x+e.w/2;
   const nearby=this.platforms.filter(s=>s.id!==e.support&&e.y+e.h-s.y<=100&&this.platformAvailable(e,s)&&this.groundAt(s.x+s.w/2)?.id===this.groundAt(center)?.id).map(s=>({s,aim:this.safeAim(s,center+e.dir*110)})).filter(t=>t.aim!=null&&Math.abs(t.aim-center)<200).sort((a,b)=>Math.abs(a.aim-center)-Math.abs(b.aim-center));
   for(const t of nearby)if(this.startJump(e,t.s,t.aim,LOW_JUMP))return;
   if(this.startDrop(e))return;
  }
 }
 enemyStep(e,dt){
  e.cooldown=Math.max(0,e.cooldown-dt);e.attackCooldown=Math.max(0,e.attackCooldown-dt);e.jumpCooldown=Math.max(0,e.jumpCooldown-dt);e.trail.forEach(t=>t.life-=dt);e.trail=e.trail.filter(t=>t.life>0);
  const p=this.player,dx=p.x+p.w/2-e.x-e.w/2,distance=Math.abs(dx),sameHeight=Math.abs((p.y+p.h)-(e.y+e.h))<55;if(distance<DETECTION_RANGE&&e.kind==='main')e.active=true;
  if(e.kind==='grey')this.patrol(e,dt);
  else if(e.mode==='idle'){
   const direction=Math.sign(dx)||e.dir;
   // El dash tiene prioridad sobre la persecución y los saltos.
   if(e.active&&sameHeight&&e.grounded&&distance>=DASH_RANGE[0]&&distance<=DASH_RANGE[1]&&e.cooldown===0&&this.safeDash(e,direction,20)){e.mode='charge';e.timer=.45;e.vx=0;e.dashDir=direction;e.dir=direction;}
   else{
    if(e.active)this.pursue(e);else this.patrol(e,dt);
    if(e.active&&sameHeight&&e.grounded&&distance<ATTACK_RANGE+e.w/2&&e.attackCooldown===0){e.mode='windup';e.timer=.25;e.vx=0;e.dir=direction;e.attackFromDash=false;}
   }
  }else{
   e.timer-=dt;
   if(e.mode==='charge'){e.vx=0;if(!e.grounded){e.mode='recover';e.timer=.4;}else if(e.timer<=0){e.mode='dash';e.timer=DASH_DURATION;e.cooldown=DASH_COOLDOWN;}}
   if(e.mode==='dash'){
    e.vx=e.dashDir*DASH_SPEED;e.dir=e.dashDir;e.trail.push({x:e.x,y:e.y,life:.25});
    if(!this.safeDash(e,e.dir,Math.max(14,Math.abs(e.vx)*dt+8))){e.vx=0;e.mode='recover';e.timer=.4;}
    else if(sameHeight&&dx*e.dir>=0&&distance<=ATTACK_RANGE+e.w/2){e.mode='windup';e.timer=.12;e.vx=0;e.attackFromDash=true;}
    else if(e.timer<=0){e.mode='recover';e.timer=.4;e.vx=0;}
   }else if(e.mode==='windup'){e.vx=0;if(e.timer<=0){e.mode='attack';e.timer=ATTACK_DAMAGE_DELAY+.18;e.attackShownAt=null;}}
   else if(e.mode==='attack'){e.vx=0;if(e.timer<=0){e.mode='recover';e.timer=.4;e.attackCooldown=.9;}}
   else if(e.mode==='recover'){e.vx=0;if(e.timer<=0){e.mode='idle';e.attackFromDash=false;}}
  }
  const previous={x:e.x,y:e.y,support:e.support};this.move(e,dt);
  // Última barrera de seguridad para que los enemigos nunca ocupen pinchos.
  if(this.spikes.some(s=>this.overlap(e,s))){e.x=previous.x;e.y=previous.y;e.vx=0;e.vy=0;e.grounded=true;e.support=previous.support;e.dir*=-1;e.routeTarget=null;if(e.kind==='main'){e.mode='recover';e.timer=.4;}}
  if(e.y>650){e.x=e.spawn;e.y=e.spawnY??GROUND-e.h;e.vy=0;e.mode='idle';e.trail=[];e.routeTarget=null;}
 }
 attackBox(e){return{x:e.dir>0?e.x+e.w:e.x-ATTACK_RANGE,y:e.y+6,w:ATTACK_RANGE,h:e.h-8};}
 markAttackVisible(e){if(e.mode==='attack'&&e.attackShownAt==null)e.attackShownAt=this.time;}
 attackCanDamage(e){return e.mode==='attack'&&e.attackShownAt!=null&&this.time-e.attackShownAt>=ATTACK_DAMAGE_DELAY-1e-9;}
 defeat(e){
  if(!e.alive)return;e.alive=false;e.trail=[];if(e.kind==='grey'){this.greyKills++;this.events.push({type:'stomp',grey:true});return;}
  this.kills++;let under=this.surfaceBelow(e.x+e.w/2,e.y+e.h);if(!under)under=this.groundAt(e.spawn+24);
  const center=this.safeAim(under,e.x+e.w/2,64)??under.x+40;this.pickups.push({id:e.id,x:center-16,y:under.y-36,w:32,h:32});this.events.push({type:'stomp',id:e.id});if(this.kills===5){this.won=true;this.events.push({type:'win'});}
 }
 feetHit(e){const p=this.player,bottom=p.y+p.h;return p.feetTimer>0&&e.x+e.w>p.x+2&&e.x<p.x+p.w-2&&e.y>=bottom-6&&e.y<=bottom+2;}
 airFeetHit(e,oldBottom,oldEnemyTop){const p=this.player,before=oldEnemyTop-oldBottom,after=e.y-p.y-p.h;return !p.grounded&&e.x+e.w>p.x+2&&e.x<p.x+p.w-2&&before>=-2&&after<=2&&after>=-14&&after<before;}
 tick(dt,input={}){if(this.state!=='playing')return;let remaining=Math.min(Math.max(dt,0),1/15);while(remaining>0&&this.state==='playing'){const step=Math.min(remaining,1/120);this.step(step,input);remaining-=step;}}
 step(dt,input){
  this.time+=dt;const p=this.player,oldBottom=p.y+p.h,wasGrounded=p.grounded;p.feetTimer=Math.max(0,p.feetTimer-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.coyote=p.grounded?.1:Math.max(0,this.coyote-dt);p.vx=((input.right?1:0)-(input.left?1:0))*245;if(p.vx)p.facing=Math.sign(p.vx);
  if(this.jumpBuffer>0&&this.coyote>0){p.vy=-590;p.grounded=false;this.jumpBuffer=0;this.coyote=0;p.feetTimer=0;}this.move(p,dt);
  if(!wasGrounded&&p.grounded&&!this.surfaces[p.support].ground)p.feetTimer=.5;
  const pit=this.pits.find(q=>p.x+p.w/2>q.x&&p.x+p.w/2<q.x+q.w);if(pit&&!p.grounded&&p.y+p.h>GROUND+4)this.fallPit=pit;if(p.grounded)this.fallPit=null;
  if(!this.won&&this.spikes.some(s=>this.overlap(p,s))){this.lose('Has sido victima de las malas decisiones de diseño');return;}
  if(p.y>600){if(this.won){p.x=65;p.y=GROUND-p.h;p.vy=0;}else{this.lose(`Has sido victima de un bloqueo ${(this.fallPit||pit||this.pits[0]).type}.`);return;}}
  for(const e of this.enemies){if(!e.alive)continue;const oldEnemyTop=e.y;this.enemyStep(e,dt);
   const stomp=p.vy>0&&oldBottom<=oldEnemyTop+8&&this.overlap(p,e),protectedFeet=this.feetHit(e),airFeet=this.airFeetHit(e,oldBottom,oldEnemyTop);
   if(stomp||protectedFeet||airFeet){this.defeat(e);if(stomp||airFeet){p.y=e.y-p.h;p.vy=-365;p.grounded=false;this.coyote=0;}continue;}
   if(this.overlap(p,e)||(e.kind==='main'&&this.attackCanDamage(e)&&this.overlap(p,this.attackBox(e)))){this.lose(e.kind==='grey'?'Has sido victima de las malas decisiones de diseño':`Has sido victima de ${e.blockName}`);if(!this.won)return;}
  }
  for(const d of this.pickups)if(!this.collected.has(d.id)&&this.overlap(p,d)){this.collected.add(d.id);this.state='reflection';this.events.push({type:'reflection',id:d.id});break;}
 }
}
const api={Game,reflections,GROUND,WORLD,DASH_COOLDOWN,DASH_RANGE,ATTACK_RANGE,BLOCKS,LOW_JUMP,HIGH_JUMP,DETECTION_RANGE};if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.CraftGame=api;
})(typeof window!=='undefined'?window:globalThis);
