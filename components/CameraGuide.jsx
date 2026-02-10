import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const CameraGuide = ({ onBack }) => {
    const [guidance, setGuidance] = useState("Analyzing environment...");
    const [detected, setDetected] = useState([]);

    // Mock detection loop for demo purposes
    useEffect(() => {
        const messages = [
            "Path is clear. Move forward.",
            "Detecting object on the left...",
            "Person detected. 2 meters ahead.",
            "Scanning for currency...",
            "No currency bills detected."
        ];

        let i = 0;
        const interval = setInterval(() => {
            setGuidance(messages[i]);
            i = (i + 1) % messages.length;
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const videoConstraints = {
        facingMode: { exact: "environment" }
    };

    return (
        <div className="camera-container">
            <Webcam
                className="webcam-feed"
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMediaError={() => setGuidance("Camera not accessible. Please check permissions.")}
            />

            <div className="overlay">
                <div className="guidance-box">
                    <div className="icon">👁️</div>
                    <div className="text">{guidance}</div>
                </div>
            </div>

            <button className="back-btn" onClick={onBack}>Stop Guidance</button>

            <style>{`
        .camera-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: black;
          z-index: 100;
        }
        .webcam-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .overlay {
          position: absolute;
          bottom: 20%;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .guidance-box {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 90%;
        }
        .icon {
          font-size: 2rem;
          animation: pulse 2s infinite;
        }
        .text {
          font-size: 1.2rem;
          font-weight: 500;
          color: #fff;
        }
        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: rgba(255, 0, 0, 0.6);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: bold;
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default CameraGuide;
