import React, { useRef, useEffect, useState } from 'react';
import buzzer from './audio/intrude.mp3';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [backgroundFrame, setBackgroundFrame] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [Devices, SetDevices] = useState([])
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back camera
  const [sensorStatus, setSensorStatus] = useState(false);
  useEffect(() => {
    if (!/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      getCameras()
    }

    initCamera();
  }, []);

  // Hey Tea

  // Function to set the video stream as the source for the video element
  const initCamera = async () => {
    try {
      const constraints = { video: { facingMode: facingMode } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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

  function intruder() {
    const buzz = document.getElementById('buzz')
    buzz.play()
  }

  const deactivateSensor = () => {
    console.log(sensorStatus);
    setSensorStatus(false);
    console.log(sensorStatus);
  };

  // Function to capture a frame from the video and detect motion
  const activateSensor = () => {
    console.log(sensorStatus);
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

    if (sensorStatus == null) {
      setSensorStatus(true);
      console.log(sensorStatus);
    } else if (sensorStatus == true) {
      for (let i = 0; i < frameData.length; i += 4) {
        // Calculate the absolute difference in pixel values between the frames
        const diff =
          Math.abs(frameData[i] - backgroundFrame[i]) +
          Math.abs(frameData[i + 1] - backgroundFrame[i + 1]) +
          Math.abs(frameData[i + 2] - backgroundFrame[i + 2]);
  
        // If the difference exceeds a threshold, mark it as motion (you can adjust the threshold value)
        if (diff > 100) {
            console.log(sensorStatus);
            // Do something when motion is detected (e.g., display an alert or change the background color)
            intruder();
            document.body.style.backgroundColor = 'red';
            break;
        } else {
          document.body.style.backgroundColor = 'white';
          break;
        }
      }
    } else if (sensorStatus == false) {
        console.log(sensorStatus);
        setSensorStatus(false);
    }

    // Update the backgroundFrame with the current frame for the next iteration
    backgroundFrame.set(frameData);
    requestAnimationFrame(activateSensor);
  };
  // Function to toggle between front and back cameras for iOS devices
  const toggleCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
  };

  return (
    <div>
      <div className="video-container">
        <video id="video" ref={videoRef} autoPlay></video>
      </div>
      <canvas id="canvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div className="container">

        {/* Show the toggle button only on iOS devices */}
        {(function () {

          if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {

            return <button type="button" onClick={toggleCamera} className="cool-button">
              {facingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
            </button>
          } else {
            return <select className='cool-select' onChange={handleOptionChange}>{Devices && Devices.map((el) => {
              return <option key={el.label} value={el.deviceID} >{el.label}</option>
            }
            )}
            </select>
          }
        })()}
        <audio id='buzz' src={buzzer}></audio>
        {
          (sensorStatus == null) ?
          <button type="button" onClick={activateSensor} className="cool-button">Double Tap</button> :
          (sensorStatus == true) ?
          <button type="button" onClick={deactivateSensor} className="cool-button">Deactivate Sensor</button> :
          <button type="button" onClick={activateSensor} className="cool-button">Double Tap</button>
        }
      </div>
    </div>
  );
};

export default App;