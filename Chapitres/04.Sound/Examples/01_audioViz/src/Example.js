export default class App {
  constructor() {
    this.audioFile = "./noise.m4a";
    this.audio = new Audio(this.audioFile);
    this.isPlaying = false;
    this.audio.controls = true;
    document.body.appendChild(this.audio);

    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    this.ctx = canvas.getContext("2d");

    document.addEventListener("click", () => {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        console.log(this.audioContext);

        this.setup();
      } else {
        if (!this.isPlaying) {
          this.audio.play();
          this.isPlaying = true;
        } else {
          this.audio.pause();
          this.isPlaying = false;
        }
      }
    });
  } // fin du constructeur

  setup() {
    // on crée un noeud source
    this.source = this.audioContext.createMediaElementSource(this.audio);
    // on crée un noeud d'analyse
    this.analyser = this.audioContext.createAnalyser();
    // crée un noeud de destination
    this.destination = this.audioContext.destination;
    // on connecte le noeud source à l'analyseur
    this.source.connect(this.analyser);
    // on connecte l'analyseur à la destination
    this.analyser.connect(this.destination);
    // on definie la taille du buffer
    this.analyser.fftSize = 2048;
    // on crée un tableau de données pour l'anayse de frequences (en Byte)
    this.dataArray = new Uint8Array(this.analyser.fftSize);
    // on crée un tableau de données pour l'anayse de waveform (en Byte)
    this.waveArray = new Uint8Array(this.analyser.fftSize);
    this.draw();
  }

  // on crée une méthode pour analyser les données de frenquences
  analyseFrequencies() {
    this.analyser.getByteFrequencyData(this.dataArray);
  }

  analyseWaveform() {
    this.analyser.getByteTimeDomainData(this.waveArray);
  }

  draw() {
    console.log("draw");
    this.analyseFrequencies();
    console.log(this.dataArray);

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // visualisation des frequences
    const barWidth = window.innerWidth / (this.dataArray.length / 2);
    let x = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const barHeight = this.dataArray[i] * 3;
      this.ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      this.ctx.fillRect(x, window.innerHeight - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    requestAnimationFrame(this.draw.bind(this));
  }
}
window.onload = () => {
  new App();
};
