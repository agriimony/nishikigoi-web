// RANDOMIZER SETUP
function random_hash() {
  let x = "0123456789abcdef", hash = '0x';
  for (let i = 64; i > 0; --i) {
    hash += x[Math.floor(Math.random()*x.length)]
  }
  return hash;
}

tokenData = {
  "hash": random_hash(),
  "tokenId": "123000456"
}

let hash = tokenData.hash

let seed2 = parseInt(hash.slice(0, 16), 16);

//GLOBALS
var DEFAULT_SIZE = 800;
var W = window.innerWidth;
var H = window.innerHeight;
var DIM = Math.min(W, H);
W = DIM;
H = DIM;
var M = DIM / DEFAULT_SIZE;
let N = 100; // smoothness
let ns = 0.75; // noise level
let countMax = 1000;
let lastFed = -30 * 60;
var started = false;

//ARRAYS
let fishes = [];
let leaves = [];
let pois = [];
let flower = [];

//ENVIRONMENTALS
let bgCol;
let leafCol1;
let leafCol2;
let strokeCol;
let flowerCol1;
let flowerCol2;
var envCol;
var nFish;
var nLeaf;
var hasFlower;
var R;

class Random { // Source: https://en.wikipedia.org/wiki/Xorshift licensed under CC-BY-SA 3.0.
  constructor(seed) {
    this.seed = seed
  }

  // Random dec from 0 - 1
  random_dec() {
    /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
    this.seed ^= this.seed << 13
    this.seed ^= this.seed >> 17
    this.seed ^= this.seed << 5
    return ((this.seed < 0 ? ~this.seed + 1 : this.seed) % 1000) / 1000
  }

  // Random dec from a to b
  random_num(a, b) {
    return a + (b - a) * this.random_dec()
  }

  // Random int from a to b
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1))
  }
}

// CLASSES
class Leaf {
  constructor(x, y, size) {
    this.size = size * M;
    this.pos = createVector(x, y);
    this.vel = createVector(R.random_num(-0.1, 0.1) * M, R.random_num(-0.1, 0.1) * M);
    this.ang = R.random_num(0, TWO_PI);
    this.angvel = R.random_num(-PI / 2560, PI / 2560);
    this.speed = this.vel.mag();
    this.col = color(red(leafCol1) + 50 * (noise(this.size) * 0.5 - 1), green(leafCol1) + 50 * (noise(this.size + 10) * 0.5 - 1), blue(leafCol1) + 50 * (noise(this.size + 20) * 0.5 - 1), alpha(leafCol1));
    this.col2 = color(red(leafCol2) + 50 * (noise(this.size) * 0.5 - 1), green(leafCol2) + 50 * (noise(this.size + 10) * 0.5 - 1), blue(leafCol2) + 50 * (noise(this.size + 20) * 0.5 - 1), alpha(leafCol2));
    this.lines = R.random_int(5, 10);
  }

  move() {
    this.pos.add(this.vel);
    this.ang += this.angvel;
    if (this.pos.x > W) { this.vel.reflect(createVector(-1, 0)); }
    if (this.pos.x < 0) { this.vel.reflect(createVector(1, 0)); }
    if (this.pos.y > H) { this.vel.reflect(createVector(0, -1)); }
    if (this.pos.y < 0) { this.vel.reflect(createVector(0, 1)); }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    fill(this.col);
    for (let i = 0; i < 100; i++) {
      let c = lerpColor(this.col2, this.col, i / 10);
      fill(c);
      ellipse(this.size * i / 400, this.size * i / 400, this.size * (1 - i / 100));
    }

    noFill();
    stroke(this.col2);
    strokeWeight(1.8);
    rotate(this.ang);
    for (let i = 0; i < this.lines; i++) {
      let a = TWO_PI / this.lines;
      push();
      rotate(a * i);
      line(0.15 * this.size / 2, 0, this.size / 3, 0);
      pop();
    }

    pop();
  }

  display_shadow() {
    push();
    translate(20 * M, 20 * M);
    blendMode(MULTIPLY);
    fill(70, 100);
    ellipse(this.pos.x, this.pos.y, this.size);
    translate(-20 * M, -20 * M);
    blendMode(BLEND);
    pop();
  }
}

class Flower extends Leaf {
  constructor(x, y, size) {
    super(x, y, size);
    this.col = flowerCol1;
    this.col2 = flowerCol2;
  }

  move() {
    this.pos.add(this.vel);
    this.ang += this.angvel;
    if (this.pos.x > W) { this.vel.reflect(createVector(-1, 0)); }
    if (this.pos.x < 0) { this.vel.reflect(createVector(1, 0)); }
    if (this.pos.y > H) { this.vel.reflect(createVector(0, -1)); }
    if (this.pos.y < 0) { this.vel.reflect(createVector(0, 1)); }
  }

  display_flower() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.ang);
    fill(this.col);
    let petalSize = this.size / 2;
    let nPetal = 10;
    for (let k = 0; k < 3; k++) {
      rotate(TWO_PI / nPetal / 2);
      scale(1 - k / 10);
      for (let j = 0; j < nPetal; j++) {
        rotate(TWO_PI / nPetal);
        push();
        for (let i = 0; i < 10; i++) {
          scale(0.95);
          fill(lerpColor(this.col2, this.col, i / 10));
          beginShape();
          vertex(0, 0);
          bezierVertex(0, 0, -petalSize / 4, petalSize / 2 - 0.3 * petalSize, -petalSize / 4, petalSize / 2);
          bezierVertex(-petalSize / 4, petalSize / 2 + 0.3 * petalSize, 0, petalSize, 0, petalSize);
          bezierVertex(0, petalSize, petalSize / 4, petalSize / 2 + 0.3 * petalSize, petalSize / 4, petalSize / 2);
          bezierVertex(petalSize / 4, petalSize / 2 - 0.3 * petalSize, 0, 0, 0, 0);
          endShape();
        }
        pop();
      }
    }
    fill(248, 191, 7);
    for (let i = 0; i < 8; i++) {
      ellipse(cos(i) * 10 * M, sin(i) * 10 * M, 5 * M, 5 * M);
    }
    pop();
  }

  display_aura() {
    push();
    let petalSize = this.size / 1.9;
    let nPetal = 10;
    translate(this.pos.x, this.pos.y);
    rotate(this.ang);
    blendMode(OVERLAY);
    fill(200, 100);
    for (let i = 0; i < nPetal * 3; i++) {
      rotate(TWO_PI / nPetal / 3);
      beginShape();
      vertex(0, 0);
      bezierVertex(0, 0, -petalSize / 4, petalSize / 2 - 0.3 * petalSize, -petalSize / 4, petalSize / 2);
      bezierVertex(-petalSize / 4, petalSize / 2 + 0.3 * petalSize, 0, petalSize, 0, petalSize);
      bezierVertex(0, petalSize, petalSize / 4, petalSize / 2 + 0.3 * petalSize, petalSize / 4, petalSize / 2);
      bezierVertex(petalSize / 4, petalSize / 2 - 0.3 * petalSize, 0, 0, 0, 0);
      endShape();
    }
    pop();
  }
}

// Rorschach code from https://openprocessing.org/sketch/541006/
function blob(cx, cy, r, thresh, time, ns, inv) {
  beginShape();
  let a = PI / 2;
  for (let i = 0; i <= N + 1; i++) {
    let x = cx + r * sin(a);
    let y = cy + r * cos(a);
    a += TWO_PI / N;

    let b = TWO_PI * i / (N + 1);
    if (inv) {
      b = TWO_PI - b;
    }

    let s = noise(ns * (10 + cos(b)), ns * (10 + sin(b)), time);
    let s2 = 1;
    if (dist(cx + s * (x - cx), cy + s * (y - cy), 0, 0) > thresh) { //if vertex goes out of bounds, set scaling factor s2
      s2 = thresh / mag(cx + s * (x - cx), cy + s * (y - cy));
    }
    curveVertex((cx + s * (x - cx)) * s2, (cy + s * (y - cy)) * s2);
  }
  endShape();
}

class Fish {
  constructor() {
    this.pos = createVector(R.random_num(0, W), R.random_num(0, H)); // Position vector of fish
    this.poi = createVector(0, 0); // Position vector of interest
    this.vel = createVector(R.random_dec() * M, R.random_dec() * M); // initialize velocity in unit vector
    this.facing = this.vel.heading() // facing of fish
    this.speed = R.random_num(0.3, 1) * M; // magnitude to scale vel
    this.maxTurn = PI / R.random_int(512, 1024);
    this.fl = round(R.random_int(175, 225) * M);
    this.laziness = R.random_int(1, 1000);
    this.jitter = round(R.random_num(0, 0.7), 2);
    this.mirror = (R.random_dec() < 0.5) ? true : false;
    this.turning = 0;
    this.n_blobs = R.random_int(5, 15);
    this.n_blobs2 = R.random_int(0, 5);
    this.blobs = [];
    this.blobs2 = [];
    this.ftr = R.random_dec();
    if (this.ftr < 0.2) {
      this.fin_type = "ephemeral";
    } else {
      this.fin_type = "classic";
    }
    this.pattern = "rorschach";
    this.pr = R.random_dec();
    if (this.pr < 0.1) {
      this.palette = "white";
    } else if (this.pr < 0.25) {
      this.palette = "black";
    } else if (this.pr < 0.5) {
      this.palette = "gold";
    } else {
      this.palette = "classic";
    }
    this.col1 = this.palette_picker(this.palette)[0];
    this.col2 = this.palette_picker(this.palette)[1];
    this.col3 = this.palette_picker(this.palette)[2];
    this.fincol = color(strokeCol, 50);

    // Patterns
    // Initialize blobs
    for (let i = 0; i < this.n_blobs; i++) { // define an x position and a radius for each blob
      let cx = R.random_int(0, this.fl * 0.9);
      let cy = R.random_num(-1, 1);
      let r = R.random_num(0.1, 0.5);
      this.blobs[i] = new p5.Vector(cx, cy, r);
    }

    for (let j = 0; j < this.n_blobs2; j++) {
      let cx = R.random_int(0, this.fl * 0.9);
      let cy = R.random_num(-1, 1);
      let r = R.random_num(0, 0.3);
      this.blobs2[j] = new p5.Vector(cx, cy, r);
    }
  }

  palette_picker(p) {
    let pal;
    let c1;
    let c2;
    let c3;
    if (p == "classic") {
      c1 = color(255, 82, 45, 10);
      c2 = color(10, 230);
      c3 = color(250, 200);
    } else if (p == "black") {
      c1 = color(10, 10);
      c2 = color(70, 250);
      c3 = color(255, 82, 45, 230);
    } else if (p == "white") {
      c1 = color(250, 10);
      c2 = color(255, 82, 45, 230);
      c3 = color(10, 250);
    } else if (p == "gold") {
      c1 = color(243, 175, 10, 10);
      c2 = color(20, 230);
      c3 = color(250, 200);
    }
    pal = [c1, c2, c3];
    return (pal);
  }

  display_fin(fin_type) {
    push();
    if (fin_type == "classic") { // use classic fin shape
      push();
      rotate(sin(noise((time / 2 + this.speed))));
      fill(250, 50);
      this.fincol.setAlpha(100);
      stroke(this.fincol);
      beginShape();
      curveVertex(0, 0);
      curveVertex(0, 0);
      curveVertex(this.fl * 0.25, 0);
      curveVertex(this.fl * 0.2, this.fl * 0.15);
      curveVertex(0, this.fl * 0.05);
      curveVertex(0, this.fl * 0.05);
      endShape();
      for (let i = 0; i < 5; i++) {
        let x2 = lerp(this.fl * 0.25, this.fl * 0.2, i / 5);
        let y2 = lerp(0, this.fl * 0.15, i / 5);
        let y1 = lerp(0, this.fl * 0.05, i / 5);
        line(0, y1, x2, y2);
      }
      pop();
    } else if (fin_type == "ephemeral") { // waterfall fin type
      noFill();
      this.fincol.setAlpha(50);
      stroke(this.fincol);
      strokeWeight(3);
      rotate(sin(noise(time / 2 + this.speed))) / 2;
      //let r = time / 2 * this.speed;
      for (let i = 0; i < 50; i += 5) {
        let x1 = -0.025 * this.fl + i / 3 * M;
        let x2 = 0.025 * this.fl + i * M;
        let x3 = 0.2 * this.fl + i * M;
        let x4 = this.speed / 4 * this.fl + 1 / (i + 1) * M;
        let y1 = 0 + i * M;
        let y2 = -0.05 * this.fl + i * M;
        let y3 = 0.05 * this.fl + i * M;
        let y4 = 0.05 * this.fl + 1 / (i + 1) * M;

        bezier(x1, y1, x2, y2, x3, y3, x4, y4);
      }
    }
    pop();
  }

  display_top_fin(fin_type) {
    push();
    if (fin_type == "classic") {
      fill(this.fincol);
      beginShape();
      let a = createVector(0, 0);
      let b = createVector(0, 0);
      let ang = 0;
      for (let i = 0; i < this.fl * 0.75; i++) {
        let diff = createVector(cos(ang), sin(ang));
        a.add(diff);

        if (i < this.fl * 0.3) {
          b.add(diff.add(0, -0.3)); // b is used for the tip of the fin
        }

        if (i > this.fl * 0.2) {
          curveVertex(a.x, a.y);
        }
        ang += this.turning / this.fl;
      }

      vertex(b.x / 2 + b.x / 2 * noise(time / 2 + this.speed), b.y / 2 + b.y / 2 * noise(time / 2 + this.speed));

      endShape(CLOSE);
    } else if (fin_type == "ephemeral") {
      noFill();
      stroke(this.fincol);
      strokeWeight(2);
      let startn = this.fl * 0.2;
      let endn = this.fl * 0.75;
      let ang = this.turning / this.fl;
      let startx = 0.5 + sin((2 * startn + 1) / 2 * ang) / (2 * sin(ang / 2));
      let starty = sin(startn * ang / 2) * sin((startn + 1) * ang / 2) / (sin(ang / 2));
      let endx = 0.5 + sin((2 * endn + 1) / 2 * ang) / (2 * sin(ang / 2));
      let endy = sin(endn * ang / 2) * sin((endn + 1) * ang / 2) / (sin(ang / 2));
      //let r = time / 2 * this.speed;

      for (let i = 0; i < 50; i += 5) {
        let x1 = startx;
        let x2 = startx + 10 * cos(this.turning) * M - i * M;
        let x3 = endx - cos(this.turning) * 4 * i * M;
        let x4 = endx;
        let y1 = starty;
        let y2 = starty - i * M;
        let y3 = endy - sin(this.turning) * 2 * i * M;
        let y4 = endy;

        bezier(x1, y1, x2, y2, x3, y3, x4, y4);
      }
    }

    pop();
  }

  display_pattern(p, blobs, col) {
    push();
    fill(col);
    if (p == "rorschach") {
      for (let i = 0; i < this.fl; i++) {
        translate(1, 0);
        rotate(this.turning / this.fl);
        let fw;
        if (i < this.fl * 0.6) {
          fw = 0.05 * this.fl + pow(this.fl * i, 0.4);
        } else if (i < this.fl * 0.75) {
          fw = 0.05 * this.fl + pow(this.fl * this.fl * 0.6, 0.4);
        } else {
          fw = 0.05 * this.fl + pow(this.fl * this.fl * 0.75 - this.fl * 5 * (i - this.fl * 0.75), 0.4);
        }
        for (let j = 0; j < blobs.length; j++) {
          if (i == blobs[j].x) {
            blob(0, fw / 2 * blobs[j].y - blobs[j].z * fw / 2, blobs[j].z * fw * 1.5, fw / 2, time + j, ns, false);
            if (this.mirror) {
              blob(0, -fw / 2 * blobs[j].y + blobs[j].z * fw / 2, blobs[j].z * fw * 1.5, fw / 2, time + j, ns, true);
            }
          }
        }
      }
    }
    pop();
  }

  display_eyes() {
    push();
    for (let i = 0; i < 0.75 * this.fl; i++) {
      translate(1, 0);
      rotate(this.turning / this.fl);
    }
    fill(255, 230);
    //stroke(this.col1);
    //strokeWeight(2);
    ellipse(0, (0.05 * this.fl + pow(this.fl * this.fl * 0.6, 0.4)) / 2 - 0.025 * this.fl, this.fl * 0.1, this.fl * 0.035);
    ellipse(0, -(0.05 * this.fl + pow(this.fl * this.fl * 0.6, 0.4)) / 2 + 0.025 * this.fl, this.fl * 0.1, this.fl * 0.035);
    fill(0, 200);
    //noStroke();
    ellipse(this.fl * 0.015, (0.05 * this.fl + pow(this.fl * this.fl * 0.6, 0.4)) / 2 - 0.025 * this.fl, this.fl * 0.05, this.fl * 0.03);
    ellipse(this.fl * 0.015, -(0.05 * this.fl + pow(this.fl * this.fl * 0.6, 0.4)) / 2 + 0.025 * this.fl, this.fl * 0.05, this.fl * 0.03);
    pop();
  }

  // Draw shadow
  display_shadow() {
    push();
    translate(this.pos.x, this.pos.y);
    translate(20 * M, 20 * M);
    rotate(this.facing);
    fill(20, 3);
    for (let i = 0; i < this.fl; i++) {
      translate(1, 0);
      rotate(this.turning / this.fl);
      if (i < this.fl * 0.6) {
        ellipse(0, 0, this.fl * 0.05 + pow(this.fl * i, 0.4));
      } else if (i < this.fl * 0.75) {
        ellipse(0, 0, this.fl * 0.05 + pow(this.fl * this.fl * 0.6, 0.4));
      } else {
        ellipse(0, 0, this.fl * 0.05 + pow(this.fl * this.fl * 0.75 - this.fl * 5 * (i - this.fl * 0.75), 0.4));
      }
    }
    pop();
  }

  display_body() { // Function to display the body of the fish + eyes
    noStroke();
    smooth();
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.facing);

    // Draw rear fins
    push();
    for (let i = 0; i < this.fl; i++) {
      translate(1, 0);
      rotate(this.turning / this.fl);
      if (i == round(this.fl * 0.2)) {
        push();
        translate(0, (this.fl * 0.05 + pow(this.fl * this.fl * 0.2, 0.4)) / 2);
        rotate(0.65 * PI);
        scale(0.5);
        this.display_fin(this.fin_type);
        pop();

        push();
        translate(0, -(this.fl * 0.05 + pow(this.fl * this.fl * 0.2, 0.4)) / 2);
        rotate(-0.65 * PI);
        scale(0.5, -0.5);
        this.display_fin(this.fin_type);
        pop();
      } else if (i == round(this.fl * 0.6)) {
        push();
        translate(0, (this.fl * 0.05 + pow(this.fl * this.fl * 0.6, 0.4)) / 2);
        rotate(0.65 * PI);
        this.display_fin(this.fin_type);
        pop();

        push();
        translate(0, -(this.fl * 0.05 + pow(this.fl * this.fl * 0.6, 0.4)) / 2);
        rotate(-0.65 * PI);
        scale(1, -1)
        this.display_fin(this.fin_type);
        pop();
      }
    }
    pop();

    // Draw the body
    push();
    for (let i = 0; i < this.fl; i++) {
      translate(1, 0);
      rotate(this.turning / this.fl);
      fill(this.col1);
      if (i < this.fl * 0.6) {
        ellipse(0, 0, this.fl * 0.05 + pow(this.fl * i, 0.4));
      } else if (i < this.fl * 0.75) {
        ellipse(0, 0, this.fl * 0.05 + pow(this.fl * this.fl * 0.6, 0.4));
      } else {
        ellipse(0, 0, this.fl * 0.05 + pow(this.fl * this.fl * 0.75 - this.fl * 5 * (i - this.fl * 0.75), 0.4));
      }
    }
    pop();

    // Draw the pattern
    push();
    this.display_pattern(this.pattern, this.blobs, this.col2);
    this.display_pattern(this.pattern, this.blobs2, this.col3);
    pop();

    // Draw the eyes
    this.display_eyes();

    // Draw the top fin
    this.display_top_fin(this.fin_type);

    pop();
  }

  display_tail() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.facing);
    rotate(-this.turning / 6);
    scale(-1, 1);
    if (this.fin_type == "classic") {
      push();
      fill(250, 50);
      this.fincol.setAlpha(100);
      stroke(this.fincol);
      rotate(sin(time * PI / 2 * this.speed) / 5);
      
      smooth();
      beginShape();
        curveVertex(0, 0);
        curveVertex(0, 0);
        curveVertex(0, this.fl * 0.05);
        curveVertex(this.fl * 0.35 * this.speed, this.fl * 0.15)
        curveVertex(this.fl * 0.15, 0);
        curveVertex(this.fl * 0.35 * this.speed, -this.fl * 0.15)
        curveVertex(0, -this.fl * 0.05);
        curveVertex(0, 0);
        curveVertex(0, 0);
      endShape(CLOSE);
      pop();
    } else if (this.fin_type == "ephemeral") {
      noFill();
      stroke(this.fincol);
      strokeWeight(2);
      rotate(sin(time * PI / 2 * this.speed) / 5);
      let r = time / 2 * this.speed;
      for (let i = -50; i < 50; i += 4) {
        let x1 = 0;
        let x2 = this.fl * 0.05 + this.fl * 0.25 * noise(r + 0);
        let x3 = this.fl * 0.2 + i * noise(r + 15) * M;
        let x4 = this.fl * 0.15 + 2 * abs(i) * noise(r + 30) * M;
        let y1 = 0;
        let y2 = 0 + i * noise(r + 40) * M;
        let y3 = this.fl * 0.1 + 2 * i * noise(r + 50) * M;
        let y4 = 0 + i * noise(r + 70) * M;

        bezier(x1, y1, x2, y2, x3, y3, x4, y4);
      }
    } 
    pop();
  }

  move() {
    // Update x and y coords
    this.pos.x += this.speed * cos(this.facing);
    this.pos.y += this.speed * sin(this.facing);

    // Periodic boundary conditions
    if (this.pos.x >= W) {
      this.pos.x -= W;
    }

    if (this.pos.y >= H) {
      this.pos.y -= H;
    }

    if (this.pos.x < 0) {
      this.pos.x += W;
    }

    if (this.pos.y < 0) {
      this.pos.y += H;
    }
  }

  turn() {
    let v1 = p5.Vector.sub(this.poi, this.pos);
    let ang = this.vel.angleBetween(v1);

    if (ang < -0.01) {
      this.turning -= this.maxTurn;
      this.facing -= this.maxTurn / 2;
      this.vel.rotate(-this.maxTurn / 2);
      //this.facing += this.turning / 100;
    } else if (ang > 0.01) {
      this.turning += this.maxTurn;
      this.facing += this.maxTurn / 2;
      this.vel.rotate(this.maxTurn / 2);
      //this.facing += this.turning / 100;
    }
    this.turning *= 0.99; // Decay turning
  }
}

class Drop {
  constructor() {
    this.splash_time = 0;
    this.poi = null;
  }

  update() {
    if (this.poi != null) {
      push();
      stroke(strokeCol, 255 - (time - this.splash_time) * 50 * M);
      ellipse(this.poi.x, this.poi.y, (time - this.splash_time) * 50 * M);
      ellipse(this.poi.x, this.poi.y, max(time - this.splash_time - 1.5, 0) * 20 * M);
      pop();
    }
  }
}

async function loadRand() {
  let hash = await connectWallet();

  let seed = parseInt(hash.slice(0, 16), 16);

  // RANDOMS
  R = new Random(seed);
  nFish = R.random_dec();
  if (nFish < 0.1) {
    nFish = 3;
  } else if (nFish < 0.4) {
    nFish = 2;
  } else {
    nFish = 1;
  };
  nLeaf = R.random_dec();
  if (nLeaf < 0.1) {
    nLeaf = 8;
  } else if (nLeaf < 0.3) {
    nLeaf = 6;
  } else if (nLeaf < 0.6) {
    nLeaf = 6;
  } else {
    nLeaf = 5;
  };
  hasFlower = R.random_dec();
  if (hasFlower < 0.02) {
    hasFlower = true;
  } else {
    hasFlower = false;
  }


  // ENV PALETTES
  envCol = R.random_dec();
  if (envCol < 0.1) {
    envCol = "void";
  } else if (envCol < 0.3) {
    envCol = "winter";
  } else if (envCol < 0.6) {
    envCol = "summer";
  } else {
    envCol = "spring";
  }

}

async function setup() {

  await loadRand();

  let c = createCanvas(W, H);
  c.parent("canvasForHTML");

  // Initialize color palettes
  if (envCol == "spring") {
    bgCol = color(152, 203, 206);
    leafCol1 = color(170, 195, 80, 30);
    leafCol2 = color(100, 125, 20, 200);
    flowerCol1 = color(255, 64, 153, 100);
    flowerCol2 = color(225, 224, 240, 100);
    strokeCol = 255;
  } else if (envCol == "void") {
    bgCol = color(20, 20, 30);
    leafCol1 = color(245, 255, 250, 30);
    leafCol2 = color(20, 20, 5, 100);
    flowerCol1 = color(0, 0, 0, 80);
    flowerCol2 = color(225, 244, 255, 80);
    strokeCol = 250;
  } else if (envCol == "summer") {
    bgCol = color(238, 216, 220);
    leafCol1 = color(201, 238, 197, 30);
    leafCol2 = color(151, 165, 123, 200);
    flowerCol1 = color(253, 73, 77, 100);
    flowerCol2 = color(255, 227, 227, 100);
    strokeCol = 255;
  } else if (envCol == "winter") {
    bgCol = color(202, 216, 232);
    leafCol1 = color(255, 198, 198, 30);
    leafCol2 = color(230, 105, 125, 200);
    flowerCol1 = color(140, 181, 233, 100);
    flowerCol2 = color(245, 244, 250, 90);
    strokeCol = 250;
  }

  // Initialize arrays
  for (let i = 0; i < nFish; i++) {
    pois.push(new Drop());
  }
  for (let i = 0; i < nFish; i++) {
    fishes.push(new Fish());
  }

  var count = 1;
  while (leaves.length < nLeaf & count < countMax) {
    var x = R.random_int(0, W);
    var y = R.random_int(0, H);
    var size = R.random_int(100, 200);

    var overlapping = false;
    for (let j = 0; j < leaves.length; j++) {
      if (dist(x, y, leaves[j].pos.x, leaves[j].pos.y) < size / 2 + leaves[j].size / 2 + 50) {
        overlapping = true;
      }
    }

    if (!overlapping) {
      leaves.push(new Leaf(x, y, size));
    }

    count += 1;
  }

  count = 1;
  if (hasFlower) {
    while (flower.length < 1 & count < countMax) {
      var x = R.random_int(0, W);
      var y = R.random_int(0, H);
      var size = R.random_int(100, 200);

      var overlapping = false;
      for (let j = 0; j < leaves.length; j++) {
        if (dist(x, y, leaves[j].pos.x, leaves[j].pos.y) < size / 2 + leaves[j].size / 2) {
          overlapping = true;
        }
      }

      if (!overlapping) {
        flower.push(new Flower(x, y, size));
      }

      count += 1;
    }
  }

  // Initialize overlay
  canvas2 = createGraphics(W, H);
  canvas2.noFill();
  if (envCol == "void") {
    for (let i = 0; i < 5000 * M; i++) {
      let x = map(R.random_dec(), 0, 1, -W / 2, W * 2);
      let y = map(R.random_dec(), 0, 1, -H / 2, H * 2);
      let size = R.random_dec() * 2;

      canvas2.fill(250);
      canvas2.noStroke();
      canvas2.ellipse(x, y, size);
    }
  } else {
    for (let i = 0; i < 200000 * M; i++) {
      let x1 = map(R.random_dec(), 0, 1, -W / 2, W * 2);
      let y1 = map(R.random_dec(), 0, 1, -H / 2, H * 2);
      let a = R.random_dec() * TWO_PI;
      let l = R.random_dec() * 5 + 2;
      let x2 = cos(a) * l + x1;
      let y2 = sin(a) * l + y1;
      canvas2.strokeWeight(map(R.random_dec(), 0, 1, 1 * M, 1.5 * M));
      canvas2.stroke(red(bgCol) / 2, green(bgCol) / 2, blue(bgCol) / 2, 10 + R.random_dec() * 20);
      canvas2.line(x1, y1, x2, y2);
    }
  }

  started = true;
}


function draw() {
  if (started) {
    bgCol.setAlpha(255);
    background(bgCol);
    time = 0.001 * millis();

    // Draw fishes
    for (let i = 0; i < fishes.length; i++) {
      fishes[i].display_shadow();
      fishes[i].display_tail();
      fishes[i].display_body();
      fishes[i].move();

      if (frameCount % (1000 + fishes[i].laziness) == round(fishes[i].jitter * 50)) {
        pois[i].poi = createVector(R.random_int(0, W), R.random_int(0, H));
        fishes[i].poi = pois[i].poi;
        pois[i].splash_time = time;
      }
      fishes[i].turn();
    }

    // Generate water overlay
    push()
    rotate(PI/6);
    if (envCol == "void") {
      fill(255, 10);
    } else {
      fill(255, 40);
    }
    beginShape();
    let xoff = 0;
    for (let x = 0; x < 2*W; x += W / 30){
      let y = map(noise(xoff, time / 10), 0, 1, -H * 0.2, H * 0.7);
      curveVertex(x, y);
      xoff += 0.05;
    }
    vertex(W, H);
    vertex(0, H);
    endShape(CLOSE);
    pop();

    // Draw pois
    push();
    noFill();
    for (let i = 0; i < pois.length; i++) {
      pois[i].update();
    }
    pop();

    blendMode(MULTIPLY);
    bgCol.setAlpha(50);
    background(bgCol);
    blendMode(BLEND);

    // Draw leaves
    for (let i = 0; i < leaves.length; i++) {
      leaves[i].display_shadow();
    }
    for (let i = 0; i < leaves.length; i++) {
      leaves[i].move();
      leaves[i].display();
      for (let j = i + 1; j < leaves.length; j++) { // Collision detection
        if (dist(leaves[i].pos.x, leaves[i].pos.y, leaves[j].pos.x, leaves[j].pos.y) < leaves[i].size / 2 + leaves[j].size / 2) { // Swap velocities of i and j
          let tmp = leaves[i].vel;
          leaves[i].vel = leaves[j].vel;
          leaves[j].vel = tmp;
        }
      }
    }

    for (let i = 0; i < flower.length; i++) {
      //flower[i].display_aura();
      flower[i].display_flower();
      flower[i].move();
      for (let j = 0; j < leaves.length; j++) { // Collision detection
        if (dist(flower[i].pos.x, flower[i].pos.y, leaves[j].pos.x, leaves[j].pos.y) < flower[i].size / 2 + leaves[j].size / 2) { // Swap velocities of i and j
          let tmp = flower[i].vel;
          flower[i].vel = leaves[j].vel;
          leaves[j].vel = tmp;
        }
      }
    }

    if (envCol == "void") {
      blendMode(DODGE);
    } else {
      blendMode(BURN);
    }
    image(canvas2, 0, 0);
    blendMode(BLEND);
  }
}

function mousePressed() {
  if (time - lastFed > 30 * 60) { // Only allow feeding once per 30min
    let n = R.random_int(0, nFish - 1);
    let time = 0.001 * millis();

    pois[n].poi = createVector(mouseX, mouseY);
    fishes[n].poi = pois[n].poi;
    pois[n].splash_time = time;

    lastFed = time;
  }
}