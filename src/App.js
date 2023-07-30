import React, { useRef, useEffect, useState } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [backgroundFrame, setBackgroundFrame] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [Devices, SetDevices] = useState([])
  const [Camera, SetCamera] = useState('')
  useEffect(() => {
    getCameras()
    initCamera();
  }, []);










  // Function to set the video stream as the source for the video element
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCurrentStream(stream);
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing the camera: ', err);
    }
  };

  //Function to get cameras available
  const getCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    SetDevices(videoDevices)
  }
  // Function to switch cameras
  const switchCamera = async (deviceID) => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    console.log(deviceID)
    try {
      const constraints = deviceID ? { video: { deviceId: { exact: deviceID } } } : { video: true };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setCurrentStream(newStream);
      videoRef.current.srcObject = newStream;
    } catch (error) {
      if (error.name === 'OverconstrainedError') {
        // If OverconstrainedError occurs, try with no constraints
        console.warn('OverconstrainedError: Trying with default constraints.');
        switchCamera(null);
      } else {
        console.error('Error accessing media devices:', error);
      }
    }
  };

  // Function to handle the option selection
  const handleOptionChange = (event) => {
    switchCamera(event.target.value);
  };

  // Function to capture a frame from the video and detect motion
  const detectMotion = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw the current video frame on the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get the current frame data
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // If the backgroundFrame is not set, initialize it with the first frame
    if (!backgroundFrame) {
      setBackgroundFrame(new Uint8ClampedArray(frameData));
      return;
    }

    // Compare the current frame with the background frame for motion detection
    for (let i = 0; i < frameData.length; i += 4) {
      // Calculate the absolute difference in pixel values between the frames
      const diff =
        Math.abs(frameData[i] - backgroundFrame[i]) +
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


  };

  return (
    <div>
      <video id="video" ref={videoRef} autoPlay></video>
      <canvas id="canvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div className="container">
        <select onChange={handleOptionChange}>{Devices && Devices.map((el) => {
          return <option key={el.deviceID} value={el.deviceID} >{el.label}</option>
        }
        )}
        </select>
        <button type="button" onClick={detectMotion} className="cool-button">
          Tap
        </button>
      </div>
    </div>
  );
};

export default App;
