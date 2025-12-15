import './style.css'
import AudioGenerator from './AudioGenerator.js'
import AudioVisualizer from './AudioVisualizer.js'

// Initialize audio generator and visualizer
const audioGenerator = new AudioGenerator();
const audioVisualizer = new AudioVisualizer('visualizer');

// Get button element
const toggleButton = document.getElementById('toggleButton');

// Initialize audio context on first user interaction
let isInitialized = false;

async function initializeAudio() {
  if (!isInitialized) {
    await audioGenerator.init();
    isInitialized = true;
  }
}

// Button click handler
toggleButton.addEventListener('click', async () => {
  // Initialize audio context if needed
  await initializeAudio();
  
  // Toggle audio
  audioGenerator.toggle();
  
  // Update button text and start/stop visualization
  if (audioGenerator.isPlaying) {
    toggleButton.textContent = 'Stop 440Hz Tone';
    audioVisualizer.startAnimation(audioGenerator);
  } else {
    toggleButton.textContent = 'Start 440Hz Tone';
    audioVisualizer.stopAnimation();
  }
});

console.log('Audio Wave Generator & Visualizer loaded');
