import Circle from "./classPerso/Circle.js";

let drawingContext;
let cercles = [];
let authorized = false;

function setup() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  drawingContext = canvas.getContext("2d");
  drawingContext.lineWidth = 6;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // for (let i = 0; i < 100; i++) {
  //   for (let j = 0; j < 100; j++) {
  //     // circle(i * 100, j * 100, 50);
  //     const cercle = new Circle(0, 0, 2, drawingContext);
  //     cercles.push(cercle);
  //     // cercle.affichage();
  //   }
  // }
  // cercles[100].color = "red";
  // cercles[100].radius *= 10;

  console.log("Nombre de cercles : ", cercles.length);

  mousePressed();
  mouseReleased();
  mouseMoved();
  draw();
}

function mousePressed() {
  document.addEventListener("mousedown", (e) => {
    console.log("Mouse pressed");
    authorized = true;
  });
}

function mouseReleased() {
  document.addEventListener("mouseup", (e) => {
    console.log("Mouse released");
    authorized = false;
  });
}

function mouseMoved() {
  document.addEventListener("mousemove", (e) => {
    console.log("Mouse moved");
    if (authorized) {
      for (let i = 0; i < 10; i++) {
        const cercle = new Circle(e.x, e.y, 2, drawingContext);
        cercle.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        cercle.radius = Math.random() * 10;
        cercles.push(cercle);
      }
    }
  });
}

// function circle(x, y, radius) {
//   drawingContext.beginPath();
//   drawingContext.arc(x, y, radius, 0, Math.PI * 2);
//   drawingContext.strokeStyle = "rgba(255, 124, 0, 0.3)";
//   drawingContext.stroke();
// }

function draw() {
  drawingContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawingContext.save();
  drawingContext.translate(window.innerWidth / 2, window.innerHeight / 2);
  cercles.forEach((cercle) => {
    cercle.move();
    cercle.affichage();
  });

  drawingContext.restore();
  requestAnimationFrame(draw);
}

setup();
