const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let backgroundFrame = null;

// Function to set the video stream as the source for the video element
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error('Error accessing the camera: ', err);
  }
}

// Function to capture a frame from the video and detect motion
function detectMotion() {
  // Draw the current video frame on the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get the current frame data
  const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // If the backgroundFrame is not set, initialize it with the first frame
  if (!backgroundFrame) {
    backgroundFrame = new Uint8ClampedArray(frameData);
    return;
  }

  // Compare the current frame with the background frame for motion detection
  for (let i = 0; i < frameData.length; i += 4) {
    // Calculate the absolute difference in pixel values between the frames
    const diff = Math.abs(frameData[i] - backgroundFrame[i]) +
                 Math.abs(frameData[i + 1] - backgroundFrame[i + 1]) +
                 Math.abs(frameData[i + 2] - backgroundFrame[i + 2]);

    // If the difference exceeds a threshold, mark it as motion (you can adjust the threshold value)
    if (diff > 100) {
      // Do something when motion is detected (e.g., display an alert or change the background color)
      document.body.style.backgroundColor = 'red';
      break;
    } else {
      document.body.style.backgroundColor = 'white';
    }
  }

  // Update the backgroundFrame with the current frame for the next iteration
  backgroundFrame.set(frameData);
  requestAnimationFrame(detectMotion);
}

// Call the initCamera function to start the camera stream
initCamera().then(() => {
  // Once the camera is initialized, start the motion detection loop
  requestAnimationFrame(detectMotion);
});
