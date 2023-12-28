# Motion Detector App

Welcome to the Motion Detector project! 🎉 This React application will bring out the inner detective in you as you explore the world of motion detection. Keep an eye on your surroundings and see if anything is moving suspiciously!


## Badges

Add badges from somewhere like: [shields.io](https://shields.io/)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

## Table of Contents 📚
--------------------

-   [Introduction](#introduction)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Features](#features)
-   [How It Works](#how-it-works)
-   [Contributing](#contributing)
-   [License](#license)


## Introduction 🌟
---------------

Motion Detector is a web application that utilizes your device's camera to detect motion in real-time. The project is aimed at having some fun while showcasing how you can use modern web technologies to build interesting applications. Whether you want to play detective or just add some motion to your day, Motion Detector has got you covered! Just double tap the "Double Tap" button, and let the fun begin! 📹👯‍♂️


## Installation 🛠️
----------------

To get started with Motion Detector, you'll need to have [Node.js](https://nodejs.org/) installed on your machine. Once you have Node.js, follow these simple steps:

1.  Clone this repository to your local machine using your favorite Git client or by running `git clone https://github.com/CovenantJunior/motion-detector.git` in your terminal.

2.  Navigate to the project directory by running `cd motion-detector`.

3.  Install the project dependencies by running `npm install`.


## Usage
-----

Once you have the project set up, follow these steps to start detecting motion:

1.  Make sure you have a device with a camera (laptops, phones, tablets, even smart fridges can work!).
2.  Run the development server by running `npm start` in the project directory.
3.  Open your favorite web browser and go to `http://localhost:3000` to see the Motion Detector app in action.
3.  Grant permission for the app to access your camera when prompted.
4.  When you see the live camera feed, click the "Double Tap" button to start the motion detection. Observe how the background color changes when motion is detected!
5.  Position yourself within the camera's view and get ready for the magic!


## Features
--------

Our Motion Detector project comes packed with a range of amazing features, including:

-   Real-time motion detection.
-   Responsive design for seamless use on various devices.
-   A stylish toggle button to trigger the magic.
-   Easily customizable threshold for motion detection (experiment and have fun!).
-   Graceful error handling if the camera access is denied or unavailable.


## How it Works
------------

Here's a brief overview of how the Motion Detector app works:

1.  When you start the app, it initializes the camera and sets the video stream as the source for the video element.

2.  Upon clicking the "Double Tap" button, the app captures a frame from the video stream and detects motion.

3.  To detect motion, it compares the current frame with the background frame (initial frame).

4.  If the difference in pixel values between the frames exceeds the threshold, it triggers the motion detection action (changing the background color to red).

5.  The app then updates the background frame with the current frame for the next iteration.

6.  The motion detection process continues as long as the "Double Tap" button is active.

Here's a breakdown:
The Motion Detector uses the `getUserMedia` API to access your device's camera stream. It then captures the video frames, compares them to detect motion, and performs some cool actions when motion is detected!

The magic happens in the `App.js` file. We access the camera using the `navigator.mediaDevices.getUserMedia` function and create a video element to display the live stream. Then, we create a hidden canvas to draw the frames and analyze the pixel data to check for motion.

Here's a snippet of how we're doing it:

```javascript
    // ... (see App.js for the full code)

    const detectMotion = () => {
    // ... (code for drawing frames and motion detection)

    if (diff > 100) {
        // Do something when motion is detected (e.g., display an alert or change the background color)
        document.body.style.backgroundColor = 'red';
        break;
    } else {
        document.body.style.backgroundColor = 'white';
    }

    // ... (more code for updating the background frame and requesting the next animation frame)

    };

    // ... (see App.js for the full code)
```


## Contributing 👥
---------------

We welcome contributions to the Motion Detector project! If you have any ideas for improvements, cool new features, or bug fixes, feel free to open an issue or submit a pull request. We believe that the best projects are built together with a dash of humor, so don't be shy to sprinkle some jokes in your comments too! 😉


## License 📜
----------

The Motion Detector project is licensed under the [MIT License](LICENSE), so you are free to use, modify, and distribute the code as you please. However, please note that using this app to catch actual criminals may require some additional detective skills. However, we are not responsible for any dance-offs that may ensue after using the Motion Detector app! 🩰🕺

* * * * *

That's all, folks! Thank you for checking out the Motion Detector project. We hope you have a blast with it and enjoy the thrill of motion detection. Now go ahead and explore the world through the eyes of the Motion Detector! Happy detecting! 🕵️‍♂️🚀
