import React, { useRef, useEffect, useState } from 'react';
import buzzer from './audio/intrude.mp3';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [Devices, SetDevices] = useState([])
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back camera
  const [sensorStatus, setSensorStatus] = useState(false);
  const [trigger, setTrigger] = useState(null);
  const backgroundFrameRef = useRef(null);
  useEffect(() => {
    if (!/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      getCameras()
    }

    initCamera();
  }, []);

  useEffect(() => {
    if (sensorStatus)
      sensorThing()
  }, [sensorStatus, trigger])

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
    console.log(event.target.value);
  };

  function intruder() {
    const buzz = document.getElementById('buzz')
    buzz.play()
  }

  // Function to deactivate motion detection
  const deActivateSensor = () => {
    setSensorStatus(false);
    // Force set to white background
    document.body.style.backgroundColor = 'white';
  };

  // Function to activate motion detection
  const activateSensor = () => {
    setSensorStatus(true);
  };

  // Function to capture a frame from the video and detect motion
  const sensorThing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw the current video frame on the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get the current frame data
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // If the backgroundFrame is not set, initialize it with the first frame
    if (!backgroundFrameRef.current) {
      backgroundFrameRef.current = new Uint8ClampedArray(frameData);
    }

    // Compare the current frame with the background frame for motion detection
    for (let i = 0; i < frameData.length; i += 4) {
      // Calculate the absolute difference in pixel values between the frames
      const diff =
        Math.abs(frameData[i] - backgroundFrameRef.current[i]) +
        Math.abs(frameData[i + 1] - backgroundFrameRef.current[i + 1]) +
        Math.abs(frameData[i + 2] - backgroundFrameRef.current[i + 2]);

      // If the difference exceeds a threshold, mark it as motion (you can adjust the threshold value)
      if (diff > 100) {
        // Do something when motion is detected (e.g., display an alert or change the background color)
        if (sensorStatus === false) {
          document.body.style.backgroundColor = 'white';
          break;
        }
        intruder();
        document.body.style.backgroundColor = 'red';
        // setSensorStatus(true)
        break;
      } else {
        document.body.style.backgroundColor = 'white';
      }
    }

    // Update the backgroundFrameRef.current with the current frame for the next iteration
    backgroundFrameRef.current.set(frameData);
    requestAnimationFrame(() => setTrigger(Date.now()));
  }

  // Function to toggle between front and back cameras for iOS devices
  const toggleCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
  };

  return (
    <div>
      <div className="video-container">
        <video id="video" ref={videoRef} autoPlay loop muted playsInline></video>
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
          (sensorStatus === true)
            ?
            // We should use an deactivate icon (update)
            <button type="button" onClick={deActivateSensor} className="cool-button">Deactivate Sensor</button>
            :
            // We should use an activate icon (update)
            <button type="button" onClick={activateSensor} className="cool-button">Activate Sensor</button>
        }
      </div>
      <div>
        {/* Control pallette to by added here, for user preference and nicer UI/UX. */}
      </div>
    </div>
  );
};

export default App;
