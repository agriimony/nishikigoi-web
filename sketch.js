function setup() {
  createCanvas(800, 800);
}

function draw() {
  background(0);
  time = 0.001 * millis();
  let fl = 200;
  let turning = sin(time);

  translate(255, 255)
  stroke(255);
  push();
  for (let i = 0; i < fl; i++) {
    translate(1, 0);
    rotate(turning / fl);
    fill(255);
    if (i < fl * 0.6) {
      ellipse(0, 0, fl * 0.05 + pow(fl * i, 0.4));
    } else if (i < fl * 0.75) {
      ellipse(0, 0, fl * 0.05 + pow(fl * fl * 0.6, 0.4));
    } else {
      ellipse(0, 0, fl * 0.05 + pow(fl * fl * 0.75 - fl * 5 * (i - fl * 0.75), 0.4));
    }
  }
  pop();

  push();
  rotate(-PI);
  rotate(-turning / 5);
  fill(250, 50);
  smooth();
  beginShape();
  curveVertex(0, 0);
  curveVertex(0, 0);
  curveVertex(0, fl * 0.05);
  curveVertex(fl * 0.375, fl * 0.15);
  curveVertex(fl * 0.35, fl * 0.025);
  curveVertex(fl * 0.175, 0);
  curveVertex(fl * 0.2, -fl * 0.05);
  curveVertex(fl * 0.25, -fl * 0.15);
  curveVertex(0, -fl * 0.025);
  curveVertex(0, 0);
  curveVertex(0, 0);
  endShape(CLOSE);
  pop();

  function display_fin() {
    push();
    fill(250, 50);
    beginShape();
    curveVertex(0, 0);
    curveVertex(0, 0);
    curveVertex(fl * 0.25, 0);
    curveVertex(fl * 0.2, fl * 0.15);
    curveVertex(0, fl * 0.05);
    curveVertex(0, fl * 0.05);
    endShape();
    for (let i = 0; i < 5; i++) {
      let x2 = lerp(fl * 0.25, fl * 0.2, i / 5);
      let y2 = lerp(0, fl * 0.15, i / 5);
      let y1 = lerp(0, fl * 0.05, i / 5);
      line(0, y1, x2, y2);
    }
    pop();
  }
  

  push();
  for (let i = 0; i < fl; i++) {
    translate(1, 0);
    rotate(turning / fl);
    if (i == round(fl * 0.2)) {
      push();
      translate(0, (fl * 0.05 + pow(fl * fl * 0.2, 0.4)) / 2);
      rotate(0.65 * PI);
      scale(0.5);
      display_fin();
      pop();

      push();
      translate(0, -(fl * 0.05 + pow(fl * fl * 0.2, 0.4)) / 2);
      rotate(-0.65 * PI);
      scale(0.5, -0.5);
      display_fin();
      pop();
    } else if (i == round(fl * 0.6)) {
      push();
      translate(0, (fl * 0.05 + pow(fl * fl * 0.6, 0.4)) / 2);
      rotate(0.65 * PI);
      display_fin();
      pop();

      push();
      translate(0, -(fl * 0.05 + pow(fl * fl * 0.6, 0.4)) / 2);
      rotate(-0.65 * PI);
      scale(1, -1)
      display_fin();
      pop();
    }
  }
  pop();

}
