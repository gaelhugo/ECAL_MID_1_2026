import "./style.css";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Circle {
  constructor(x, y, radius, color, index) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.angle = 0;
    this.index = index;
  }

  update() {
    this.radius =
      Math.abs(Math.sin((this.angle + this.index) * (Math.PI / 180))) * 100;

    this.angle++;
  }

  draw() {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

const circle = new Circle(200, 200, 100, "rgba(255, 0, 0, 0.3)");

const circles = [];
let index = 0;
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < 10; j++) {
    circles.push(
      new Circle(
        i * 100,
        j * 100,
        100,
        `hsla(${(index * 360) / 100}, 100%, 50%, 0.1)`,
        i * j
      )
    );
    index++;
  }
}

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ctx.beginPath();
  // ctx.arc(200, 200, 100, 0, Math.PI * 2);
  // ctx.stroke();

  // circle.update();
  // circle.draw();

  circles.forEach((circle) => {
    circle.update();
    circle.draw();
  });

  requestAnimationFrame(draw);
}

draw();
