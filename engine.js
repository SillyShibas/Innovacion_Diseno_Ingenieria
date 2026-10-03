/* Motor independiente del navegador: también se comprueba con Node. */
(function (scope) {
  'use strict';
  const GROUND = 415, WORLD = 3400;
  const reflections = [
    {name:'Miedo al error',color:'#d98073',icon:'☁',title:'Equivocarse también es avanzar',text:'El miedo al error te dice que es mejor no intentarlo. Pero un primer intento no tiene que ser perfecto: tiene que existir. Como este robot de cartón, tus ideas pueden doblarse, repararse y cambiar. Haz una prueba pequeña; cada error te da información para el siguiente paso.'},
    {name:'Perfeccionismo',color:'#a28bc8',icon:'✦',title:'Hecho vale más que perfecto',text:'Cuando esperas que todo sea perfecto, comenzar se vuelve difícil. Una idea necesita espacio para crecer, no una evaluación constante. Define una meta pequeña y alcanzable, termina un primer borrador y después mejóralo. Las marcas del proceso también forman parte de lo que creas.'},
    {name:'Comparación',color:'#edb75c',icon:'↔',title:'Tu camino tiene su propio ritmo',text:'Mirar el trabajo de otras personas puede inspirarte, pero no tiene que convertirse en una medida de tu valor. No ves todas sus pruebas ni sus tropiezos. Vuelve a tus materiales, tus preguntas y tu curiosidad. Compara tu trabajo de hoy con lo que aprendiste ayer.'},
    {name:'Distracción',color:'#70b2bb',icon:'⚡',title:'Dale un pequeño espacio a tu atención',text:'Muchas ideas y estímulos compiten por tu atención. No necesitas resolverlos todos al mismo tiempo. Aparta una distracción, elige una sola tarea y dedícale unos minutos. Una pausa consciente también ayuda: vuelve, observa y da el siguiente paso con intención.'},
    {name:'Falta de confianza',color:'#88987a',icon:'?',title:'La confianza se construye creando',text:'No siempre sentirás seguridad antes de empezar. A veces la confianza aparece después de intentarlo. Recuerda algo que ya aprendiste, pide apoyo cuando lo necesites y reconoce tus avances pequeños. Un robot hecho de materiales sencillos puede llegar lejos; tus ideas también.'}
  ];
  class Game {
    constructor(){this.reset();}
    reset(){
      this.player={x:65,y:GROUND-76,w:45,h:76,vx:0,vy:0,grounded:true,facing:1};
      this.enemies=reflections.map((r,i)=>({id:i,x:560+i*580,y:GROUND-48,w:48,h:48,min:500+i*580,max:650+i*580,speed:28+i*5,dir:1,alive:true}));
      this.platforms=[{x:275,y:335,w:125,h:16},{x:865,y:333,w:120,h:16},{x:1445,y:335,w:120,h:16},{x:2025,y:333,w:120,h:16},{x:2605,y:335,w:120,h:16}];
      this.pickups=[];this.collected=new Set();this.kills=0;this.won=false;this.state='start';this.time=0;this.jumpBuffer=0;this.coyote=.1;this.events=[];
    }
    jump(){if(this.state==='playing')this.jumpBuffer=.14;}
    overlap(a,b){return a.x < b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;}
    defeat(e){if(!e.alive)return;e.alive=false;this.kills++;this.pickups.push({id:e.id,x:e.x+8,y:GROUND-32,w:32,h:32});this.events.push({type:'stomp',id:e.id});if(this.kills===5){this.won=true;this.events.push({type:'win'});}}
    tick(dt,input={}){
      if(this.state!=='playing')return;
      dt=Math.min(Math.max(dt,0),1/30);this.time+=dt;
      const p=this.player,oldBottom=p.y+p.h;
      this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.coyote=p.grounded?.1:Math.max(0,this.coyote-dt);
      p.vx=((input.right?1:0)-(input.left?1:0))*245;if(p.vx)p.facing=Math.sign(p.vx);
      if(this.jumpBuffer>0 && this.coyote>0){p.vy=-590;p.grounded=false;this.jumpBuffer=0;this.coyote=0;}
      p.vy+=1450*dt;p.x=Math.max(0,Math.min(WORLD-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;p.grounded=false;
      for(const s of this.platforms){if(p.vy>=0 && oldBottom<=s.y+1 && p.y+p.h>=s.y && p.x+p.w>s.x && p.x<s.x+s.w){p.y=s.y-p.h;p.vy=0;p.grounded=true;}}
      if(p.y+p.h>=GROUND){p.y=GROUND-p.h;p.vy=0;p.grounded=true;}
      for(const e of this.enemies){
        if(!e.alive)continue;e.x+=e.dir*e.speed*dt;if(e.x>e.max){e.x=e.max;e.dir=-1;}if(e.x<e.min){e.x=e.min;e.dir=1;}
        if(!this.overlap(p,e))continue;
        if(p.vy>0 && oldBottom<=e.y+9){this.defeat(e);p.y=e.y-p.h;p.vy=-365;p.grounded=false;this.coyote=0;}
        else {this.state='lost';this.events.push({type:'lose'});return;}
      }
      for(const drop of this.pickups){if(!this.collected.has(drop.id)&&this.overlap(p,drop)){this.collected.add(drop.id);this.state='reflection';this.events.push({type:'reflection',id:drop.id});break;}}
    }
  }
  const api={Game,reflections,GROUND,WORLD};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.CraftGame=api;
})(typeof window!=='undefined'?window:globalThis);
