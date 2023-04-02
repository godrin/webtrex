import { initGlFrame, Shader, LinePainter } from './gl.js';
import Geometry from './math.js';

// generate an array of 3-dimensional vectors out of 2-dimensional polar-coordinates
function polar(array) {
  function c(a) {
    return Math.cos(a*Math.PI/180);
  }
  function s(a) {
    return Math.sin(a*Math.PI/180);
  }
  var scale = 0.1;
  return array.map(x=>[s(x[0])*x[1]*scale,c(x[0])*x[1]*scale,1]).flat();
}

let visuals= (function(){
  let tw = 0.27;
  let tw2 = 0.55
  return {
    enemy1: polar([
      [60,1],
      [120,tw],
      [180,1],
      [240,tw],
      [300,1],
      [0,tw]
    ]),
    enemy2 : polar([
      [45,1],
      [90,tw],
      [135,1],
      [180,tw],
      [225,1],
      [270,tw],
      [315,1],
      [0,tw]
    ]),
    enemy3 : polar([
      [45,1],
      [90,tw2],
      [135,1],
      [180,tw2],
      [225,1],
      [270,tw2],
      [315,1],
      [0,tw2]
    ]),
    ship: polar([
      [0,0.5],
      [150,0.5],
      [180,0.3],
      [210,0.5]
    ])
  };
})();

function truncPos(pos,margin) {
  if(pos.x<-margin) {
    pos.x+=2+2*margin;
  }
  if(pos.y<-margin) {
    pos.y+=2+2*margin;
  }
  if(pos.x>1+margin) {
    pos.x-=2+2*margin;
  }
  if(pos.y>1+margin) {
    pos.y-=2+2*margin;
  }
  return pos;
}

class Enemy {
  constructor(pos, v, size) {
    this.pos = pos;
    this.size = size;
    this.v = v;
  }
  move(delta, margin) {
    let d= delta*0.0001;
    this.pos.x+=this.v.x*d;
    this.pos.y+=this.v.y*d;
    this.pos = truncPos(this.pos, margin);
  }
  get position() {
    return [this.pos.x,this.pos.y,0];
  }
}

class Ship {
  constructor(pos, vel, size) {
    this.pos = pos;
    this.v = vel;
    this.size = size;
    this.rotation=30;
    this.turn = null;
    this.thrust = false;
  }
  get position() {
    return [this.pos.x,this.pos.y,0];
  }

  move(delta, margin) {
    if(this.turn == "left") {
      this.rotation-=delta*0.2;
    } else if(this.turn == "right") {
      this.rotation+=delta*0.2;
    }
    this.a = this.thrust ? 1 : 0;
    this.v.x += this.a*delta*0.0001*Math.sin(this.rotation*Math.PI/180);
    this.v.y += this.a*delta*0.0001*Math.cos(this.rotation*Math.PI/180);
    this.v.x *= 0.98;
    this.v.y *= 0.98;
    this.pos.x+=this.v.x;
    this.pos.y+=this.v.y;
    this.pos = truncPos(this.pos, margin);
  }
}



class Game {
  constructor() {
    this.enemies = [];
    for(let i=0;i<10;i++) {
      var angle = Math.random()*3.14*2;
      this.enemies.push(new Enemy(
        { x:Math.random()*2-1, y:Math.random()*2-1},
        { x:Math.sin(angle), y:Math.cos(angle) },
        Math.random()*0.5+0.5
      ));
    }
    this.ship= new Ship(
      {x:0,y:0},
      {x:0,y:0},
      1
    );
  }
  move(delta, margin) {
    for(let enemy of this.enemies) {
      enemy.move(delta, margin);
    }
    this.ship.move(delta, margin);
  }
  draw(painters) {
    for(let enemy of this.enemies) {
      painters["enemy"].draw(enemy);
    }
    painters["ship"].draw(this.ship);
  }

  checkCollisions(painters) {
    let shipLines = painters["ship"].lines(this.ship);
    for(let enemy of this.enemies) {
      let enemyLines = painters["enemy"].lines(enemy);

      if(Geometry.collide(shipLines, enemyLines)) {
        console.log("BOOM");
      }
    }
  }

  input(keys) {
    this.ship.turn = keys.left?"left":(keys.right?"right":null);
    this.ship.thrust = keys.up?true:false;
  }
}

class VxGame extends HTMLElement {
  connectedCallback() {
    console.log("connected");
    this.game = new Game();
    this.lastFrame = null;
    this.margin=0.1;
    this.keys={};

    this.canvas = document.getElementById('my_Canvas');
    this.gl = this.canvas.getContext('experimental-webgl');
    this.shader = new Shader(this.gl);
    this.painters = {
      enemy: new LinePainter(this.gl, visuals.enemy1, this.shader),
      ship: new LinePainter(this.gl, visuals.ship, this.shader)
    }
    this.startAnimation();
    document.addEventListener("keydown", this.keychanged.bind(this));
    document.addEventListener("keyup", this.keychanged.bind(this));
  }
  keychanged(e) {
    this.keys[e.key.substr(5).toLowerCase()]=e.type=="keydown";
    this.game.input(this.keys);
  }
  startAnimation() {
    window.requestAnimationFrame(this.animate.bind(this));
  }
  animate(p) {
    this.tick(p-this.lastFrame);
    this.lastFrame=p;
    window.requestAnimationFrame(this.animate.bind(this));
  }
  tick(delta) {
    if(delta>50) {
      console.log("delta too big", delta);
      delta=50;
    }
    initGlFrame(this.gl, this.canvas);
    this.game.move(delta, this.margin);
    this.game.checkCollisions(this.painters);
    this.game.draw(this.painters);
  }
}
customElements.define("vx-game", VxGame);




