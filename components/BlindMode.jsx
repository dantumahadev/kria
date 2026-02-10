import React, { useState, useEffect, useCallback } from 'react';

const BlindMode = ({ onBack }) => {
    const [tapCount, setTapCount] = useState(0);

    // URL to redirect to
    const TARGET_URL = "https://www.jotform.com/agent/019a4add964b79f3aa038b973d1fea25967d";

    // Timeout to reset taps if not fast enough
    useEffect(() => {
        let timer;
        if (tapCount > 0) {
            timer = setTimeout(() => {
                setTapCount(0);
            }, 1000); // 1 second window for 3 taps
        }
        return () => clearTimeout(timer);
    }, [tapCount]);

    useEffect(() => {
        if (tapCount >= 3) {
            // Trigger voice mode / redirect
            window.location.href = TARGET_URL;
        }
    }, [tapCount]);

    const handleTap = useCallback(() => {
        setTapCount(prev => prev + 1);
        // Haptic feedback if available for confirmation
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Announce count for screen readers
        const utterance = new SpeechSynthesisUtterance((tapCount + 1).toString());
        window.speechSynthesis.speak(utterance);
    }, [tapCount]);

    // Handle touchstart as well for better responsiveness on mobile
    // However, onClick covers both fast enough usually. 
    // Let's attach to the main div.

    return (
        <div
            className="blind-mode-container"
            onClick={handleTap}
            role="button"
            tabIndex={0}
            aria-label="Blind Mode Active. Tap anywhere three times quickly to activate voice assistant."
        >
            <div className="content">
                <div className="pulsing-circle"></div>
                <h1>Blind Mode Active</h1>
                <p>Tap 3 times anywhere on screen</p>
                <div className="count-indicator">
                    Taps: {tapCount}
                </div>
            </div>

            <button
                className="back-button"
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                aria-label="Go Back"
            >
                Back
            </button>

            <style>{`
        .blind-mode-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--blind-mode-bg);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          cursor: pointer;
          user-select: none;
        }
        .pulsing-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.2);
          position: absolute;
          animation: pulse 2s infinite;
        }
        .content {
          text-align: center;
          z-index: 2;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.5rem;
          color: #94a3b8;
        }
        .count-indicator {
          font-size: 5rem;
          font-weight: bold;
          margin-top: 2rem;
          opacity: ${tapCount > 0 ? 1 : 0.1};
          transition: opacity 0.2s;
        }
        .back-button {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          padding: 1rem 2rem;
          background: rgba(255,255,255,0.1);
          color: white;
          border-radius: 0.5rem;
          font-size: 1.2rem;
          z-index: 10;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 50px rgba(37, 99, 235, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
      `}</style>
        </div>
    );
};

export default BlindMode;
