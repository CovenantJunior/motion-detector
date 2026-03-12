/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';
import buzzer from './audio/intrude.mp3';
import './App.css';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [Devices, SetDevices] = useState([])
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back camera
  const [sensorStatus, setSensorStatus] = useState(false);
  const [trigger, setTrigger] = useState(null);
  const backgroundFrameRef = useRef(null);

  const [screenshots, setScreenshots] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenshotsEnabled, setScreenshotsEnabled] = useState(true);
  const [motionSensitivity, setMotionSensitivity] = useState(1);
  const lastScreenshotTimeRef = useRef(0);

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
    if (!soundEnabled) return;
    const buzz = document.getElementById('buzz')
    if (buzz && buzz.paused) {
      buzz.play().catch((e) => console.log('Audio error:', e));
    }
  }

  const captureScreenshot = () => {
    if (!screenshotsEnabled || !canvasRef.current) return;
    
    const now = Date.now();
    // Throttle screenshots to max 1 per second
    if (now - lastScreenshotTimeRef.current < 1000) return;
    lastScreenshotTimeRef.current = now;

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setScreenshots(prev => [{ id: now, url: dataUrl, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  // Function to deactivate motion detection
  const deActivateSensor = () => {
    setSensorStatus(false);
    backgroundFrameRef.current = null;
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
    
    if (videoRef.current && videoRef.current.videoWidth > 0 && 
        (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight)) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      backgroundFrameRef.current = null; 
    }

    if (!canvas || canvas.width === 0) {
      requestAnimationFrame(() => setTrigger(Date.now()));
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Draw the current video frame on the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get the current frame data
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // If the backgroundFrame is not set, initialize it with the first frame
    if (!backgroundFrameRef.current) {
      backgroundFrameRef.current = new Uint8ClampedArray(frameData);
      requestAnimationFrame(() => setTrigger(Date.now()));
      return;
    }

    let changedPixels = 0;
    const totalPixels = frameData.length / 4;
    const pixelDiffThreshold = 50;

    // Compare the current frame with the background frame for motion detection
    for (let i = 0; i < frameData.length; i += 4) {
      // Calculate the absolute difference in pixel values between the frames
      const diff =
        Math.abs(frameData[i] - backgroundFrameRef.current[i]) +
        Math.abs(frameData[i + 1] - backgroundFrameRef.current[i + 1]) +
        Math.abs(frameData[i + 2] - backgroundFrameRef.current[i + 2]);

      // If the difference exceeds a threshold, mark it as motion (you can adjust the threshold value)
      if (diff > pixelDiffThreshold) {
        changedPixels++;
      }
    }

    const percentageChanged = (changedPixels / totalPixels) * 100;

    if (percentageChanged > motionSensitivity) {
      // Do something when motion is detected (e.g., display an alert or change the background color)
      if (sensorStatus === false) {
        document.body.style.backgroundColor = 'white';
      } else {
        intruder();
        captureScreenshot();
        document.body.style.backgroundColor = 'red';
      }
    } else {
      document.body.style.backgroundColor = 'white';
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

  const clearScreenshots = () => setScreenshots([]);

  return (
    <div className="main-app-container">
      <h1 className="main-title">Motion Detector 🕵️‍♂️</h1>
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
              return <option key={el.label} value={el.deviceId} >{el.label || `Camera ${el.deviceId.substring(0, 5)}...`}</option>
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
            <button type="button" onClick={deActivateSensor} className="cool-button" style={{ backgroundColor: '#eb3b5a' }}>Deactivate Sensor</button>
            :
            // We should use an activate icon (update)
            <button type="button" onClick={activateSensor} className="cool-button">Activate Sensor</button>
        }
      </div>
      <div className="controls-and-screenshots">
        {/* Control pallette to by added here, for user preference and nicer UI/UX. */}
        <div className="settings-panel">
          <h3>Detector Settings</h3>
          <div className="settings-toggles">
            <label>
              <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} /> Enable Alarm Sound
            </label>
            <label>
              <input type="checkbox" checked={screenshotsEnabled} onChange={(e) => setScreenshotsEnabled(e.target.checked)} /> Capture Screenshots
            </label>
          </div>
          <div className="settings-slider">
            <label>
              Motion Threshold ({motionSensitivity.toFixed(1)}%):
            </label>
            <input 
              type="range" 
              min="0.1" max="10" step="0.1" 
              value={motionSensitivity} 
              onChange={(e) => setMotionSensitivity(parseFloat(e.target.value))} 
            />
          </div>
        </div>

        <div className="screenshots-panel">
          <h3>
            Screenshots Gallery
            {screenshots.length > 0 && (
              <button className="clear-btn" onClick={clearScreenshots} >Clear</button>
            )}
          </h3>
          <div className="gallery">
            {screenshots.length === 0 ? <p className="empty-text">No screenshots yet. Wait for motion!</p> : null}
            {screenshots.map(shot => (
              <div key={shot.id} className="screenshot-item">
                <img src={shot.url} alt={`Detected at ${shot.time}`} />
                <div className="screenshot-meta">
                  <span>{shot.time}</span>
                  <a href={shot.url} download={`motion-${shot.id}.jpg`}>Download</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
