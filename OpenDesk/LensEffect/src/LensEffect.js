export default class LensEffect {
  constructor({ range = 200, zoom = 0.2, element = window } = {}) {
    // Portée de l'effet (rayon autour du pointeur)
    this.range = range;
    // Intensité de la déformation (plus grand => plus fort)
    this.zoom = zoom;

    // Position du pointeur (en pixels, coordonnées écran)
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    // Si le bouton est pressé, on désactive l'effet (même logique que ton snippet)
    this.pressed = false;

    // Écoute des événements sur l'élément choisi (window, document, canvas, etc.)
    element.addEventListener("pointermove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    element.addEventListener("pointerdown", () => {
      this.pressed = true;
    });
    element.addEventListener("pointerup", () => {
      this.pressed = false;
    });
  }

  // Distance euclidienne entre 2 points
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Conversion d'une valeur d'un intervalle à un autre
  mapRange(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  // Applique la déformation à une particule.
  // Accepte:
  // - { position: { x, y } }
  // - ou { x, y }
  // Retourne une nouvelle position { x, y } (ne modifie pas l'objet d'entrée).
  apply(particle) {
    const position = {
      x: particle.position.x || particle.x,
      y: particle.position.y || particle.y,
    };

    let differenceX = this.mouseX - position.x;
    let differenceY = this.mouseY - position.y;

    // On mesure la distance entre le pointeur et la particule
    const lenght = this.dist(this.mouseX, this.mouseY, position.x, position.y);
    if (lenght < this.range && !this.pressed) {
      // Même logique que ton snippet : on transforme la distance en angle, puis en amplitude
      const l = this.mapRange(lenght, 0, this.range * 2, 0, Math.PI * 2);
      const angle = Math.cos(l);
      const amt = this.mapRange(angle, -1, 1, 0, this.zoom);
      differenceX *= amt;
      differenceY *= amt;
      position.x -= differenceX;
      position.y -= differenceY;
    }

    return position;
  }
}
