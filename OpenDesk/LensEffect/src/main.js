import "./style.css";

import LensEffect from "./LensEffect.js";
// Effet de "lentille" réutilisable : déforme la position des particules en fonction du pointeur.
const lens = new LensEffect({ range: 200, zoom: 0.3, element: document });

// Grille de lettres (20 colonnes x 10 lignes)
const COLS = 20;
const ROWS = 10;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Canvas plein écran
const canvas = document.querySelector("#grid");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Création des cellules : chaque cellule a une lettre + des paramètres aléatoires pour l'animation sinus
const cells = [];
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    cells.push({
      x,
      y,
      letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      speedX: 0.2 + Math.random() * 0.15,
      speedY: 0.18 + Math.random() * 0.15,
    });
  }
}

function draw(tMs) {
  // Temps (plus petit => animation plus rapide). Ici on garde ton ratio tMs/300.
  const time = tMs / 300;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Fond
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Taille des cellules
  const cellWidth = canvasWidth / COLS;
  const cellHeight = canvasHeight / ROWS;
  const cellSize = Math.min(cellWidth, cellHeight);

  // Style du texte
  ctx.font = `600 ${Math.floor(
    cellSize * 0.62
  )}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";

  // Pour chaque lettre : position de base (grille) + petite oscillation sinus + déformation "lentille"
  for (const cell of cells) {
    const baseX = (cell.x + 0.5) * cellWidth;
    const baseY = (cell.y + 0.5) * cellHeight;
    const animatedX =
      baseX +
      Math.sin(time * cell.speedX + cell.phaseX + cell.y * 0.25) *
        (cellWidth * 0.18);
    const animatedY =
      baseY +
      Math.sin(time * cell.speedY + cell.phaseY + cell.x * 0.25) *
        (cellHeight * 0.18);

    // Application de l'effet de lentille (déformation selon le pointeur)
    const distortedPosition = lens.apply({
      position: { x: animatedX, y: animatedY },
    });
    ctx.fillText(cell.letter, distortedPosition.x, distortedPosition.y);
  }

  // Boucle d'animation
  requestAnimationFrame(draw);
}

// Démarrage de l'animation
requestAnimationFrame(draw);
