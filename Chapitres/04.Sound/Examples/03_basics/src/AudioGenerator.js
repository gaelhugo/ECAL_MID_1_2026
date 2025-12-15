class AudioGenerator {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.analyser = null;
    this.isPlaying = false;
    this.frequency = 440; // 440Hz (A4 note)
  }

  async init() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser for frequency data
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048; // This gives us 1024 frequency bins
      this.analyser.connect(this.audioContext.destination);
      
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  start() {
    if (this.isPlaying || !this.audioContext) return;

    try {
      // Create oscillator
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine'; // Simple sine wave
      this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);
      
      // Connect oscillator to analyser
      this.oscillator.connect(this.analyser);
      
      // Start the oscillator
      this.oscillator.start();
      this.isPlaying = true;
      
      console.log(`Started ${this.frequency}Hz tone`);
    } catch (error) {
      console.error('Error starting audio:', error);
    }
  }

  stop() {
    if (!this.isPlaying || !this.oscillator) return;

    try {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
      this.isPlaying = false;
      
      console.log('Stopped audio');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(1024);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }
}

export default AudioGenerator;
