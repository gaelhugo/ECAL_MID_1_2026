class AudioVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.animationId = null;
    
    // Setup canvas styling
    this.setupCanvas();
  }

  setupCanvas() {
    // Set canvas background
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Set default dot color
    this.ctx.fillStyle = '#00ff88';
  }

  draw(frequencyData) {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw frequency data as dots
    this.ctx.fillStyle = '#00ff88';
    
    const dotCount = 1024; // One dot for each frequency bin
    const dotSpacing = this.width / dotCount;
    
    for (let i = 0; i < dotCount && i < frequencyData.length; i++) {
      const x = i * dotSpacing;
      
      // Map frequency data (0-255) to canvas height
      const amplitude = frequencyData[i] / 255;
      const dotHeight = amplitude * this.height;
      const y = this.height - dotHeight;
      
      // Draw dot - size based on amplitude
      const dotSize = Math.max(1, amplitude * 4);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Optional: Add a subtle glow effect for higher amplitudes
      if (amplitude > 0.1) {
        this.ctx.fillStyle = `rgba(0, 255, 136, ${amplitude * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize * 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.fillStyle = '#00ff88';
      }
    }
  }

  startAnimation(audioGenerator) {
    const animate = () => {
      const frequencyData = audioGenerator.getFrequencyData();
      this.draw(frequencyData);
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clear canvas when stopped
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

export default AudioVisualizer;
