let model;
let video;
let canvas;
let ctx;

// Function to initialize the camera and model
async function init() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error('Error accessing the camera: ', err);
  }

  // Load the COCO-SSD model
  model = await cocoSsd.load();
  detectMotion();
}

// Function to detect motion
async function detectMotion() {
  // Run object detection on the current frame
  const predictions = await model.detect(video);

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bounding boxes around detected objects
  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction.bbox;
    const label = `${prediction.class} - ${Math.round(prediction.score * 100)}%`;

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.fillText(label, x, y - 5);
    ctx.stroke();
  });

  // Schedule the next frame
  requestAnimationFrame(detectMotion);
}

// Call the init function to start the camera stream and motion detection
init();
