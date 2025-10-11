export default class Circle {
  constructor(x, y, radius, ctx) {
    this.x = x - window.innerWidth / 2;
    this.y = y - window.innerHeight / 2;
    this.radius = radius;
    this.ctx = ctx;
    this.color = "black";
    this.speedX = 0;
    this.speedY = 0;

    //Accélération
    // Accélération de la particule
    this.accelerationX = (Math.random() - 0.5) * 0.05;
    this.accelerationY = (Math.random() - 0.5) * 0.05;
  }

  move() {
    this.speedX += this.accelerationX;
    this.speedY += this.accelerationY;
    this.x += this.speedX;
    this.y += this.speedY;

    //Gestion des limites
    // d'abord à gauche
    if (this.x <= -window.innerWidth / 2) {
      this.speedX *= -1;
    }
    if (this.x >= window.innerWidth / 2) {
      this.speedX *= -1;
    }
    if (this.y <= -window.innerHeight / 2) {
      this.speedY *= -1;
    }
    if (this.y >= window.innerHeight / 2) {
      this.speedY *= -1;
    }
  }

  affichage() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
}
