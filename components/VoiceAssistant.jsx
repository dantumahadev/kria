import React, { useState, useEffect, useRef } from 'react';

const VoiceAssistant = ({ onBack }) => {
  const [status, setStatus] = useState('initializing'); // initializing, listening, speaking, processing, idle, error
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('How can I help you?');
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // We restart manually for better control
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (!isSpeakingRef.current) setStatus('listening');
      };

      recognition.onend = () => {
        // Auto-restart if we are not speaking and not processing
        if (!isSpeakingRef.current && status !== 'processing') {
          setTimeout(() => {
            try { recognition.start(); } catch (e) { /* ignore already started */ }
          }, 500);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatus('error');
          setResponse("Microphone blocked. Please allow access.");
        }
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
      };

      recognitionRef.current = recognition;

      // Initial Start
      startListening();

      // Initial Greeting
      setTimeout(() => {
        speak("How can I help you?");
      }, 1000);

    } else {
      setResponse("Voice not supported in this browser.");
      setStatus('error');
    }
  }, []);

  const speak = (text) => {
    isSpeakingRef.current = true;
    setStatus('speaking');
    setResponse(text);

    // Stop listening while speaking
    try { recognitionRef.current.stop(); } catch (e) { }

    const utterance = new SpeechSynthesisUtterance(text);

    // Safety: If onend doesn't fire effectively (common mobile bug)
    // Estimate duration: ~5 chars per second? roughly
    const estimatedDuration = Math.max(2000, text.length * 100);
    const safetyTimeout = setTimeout(() => {
      if (isSpeakingRef.current) {
        console.log("Speech timeout - forcing listen");
        handleSpeechEnd();
      }
    }, estimatedDuration + 1000);

    utterance.onend = () => {
      clearTimeout(safetyTimeout);
      handleSpeechEnd();
    };

    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      clearTimeout(safetyTimeout);
      handleSpeechEnd();
    };

    window.speechSynthesis.cancel(); // Clear queue
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechEnd = () => {
    isSpeakingRef.current = false;
    setStatus('listening');
    startListening();
  };

  const startListening = () => {
    if (isSpeakingRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Often errors if already started, safe to ignore
    }
  };

  const callBackend = async (endpoint, body = {}) => {
    try {
      // Create a visual feedback for the user
      setStatus('processing');
      const hostname = window.location.hostname;
      console.log(`[Jarvis] Calling ${hostname}:8000${endpoint}`, body);

      const res = await fetch(`http://${hostname}:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("[Jarvis] Response:", json);
      return json;
    } catch (e) {
      console.error("Backend Error", e);
      setResponse(`Connection Failed: ${e.message}`);
      setStatus('error');
      return null;
    }
  };

  const processCommand = async (cmd) => {
    setStatus('processing');
    const lowerCmd = cmd.toLowerCase();

    // --- CONVERSATION FLOW HANDLING ---



    // --- SYSTEM CORE COMMANDS (IDLE STATE) ---
    const jarvisRespond = async (speech, actionFn) => {
      await speak(speech);
      if (actionFn) await actionFn();
    };

    if (lowerCmd.includes("home")) {
      jarvisRespond("Going home.", () => callBackend('/action/general', { command: 'system', parameters: { action: 'home' } }));
      return;
    }
    if (lowerCmd.includes("back")) {
      jarvisRespond("Going back.", () => callBackend('/action/general', { command: 'system', parameters: { action: 'back' } }));
      return;
    }
    if (lowerCmd.includes("scroll down") || lowerCmd.includes("move down")) {
      jarvisRespond("Scrolling.", () => callBackend('/action/general', { command: 'scroll', parameters: { direction: 'down' } }));
      return;
    }
    if (lowerCmd.includes("scroll up") || lowerCmd.includes("move up")) {
      jarvisRespond("Scrolling up.", () => callBackend('/action/general', { command: 'scroll', parameters: { direction: 'up' } }));
      return;
    }
    if (lowerCmd.includes("volume up") || lowerCmd.includes("louder")) {
      jarvisRespond("Volume increased.", () => callBackend('/action/general', { command: 'system', parameters: { action: 'volume_up' } }));
      return;
    }
    if (lowerCmd.includes("volume down") || lowerCmd.includes("softer")) {
      jarvisRespond("Volume decreased.", () => callBackend('/action/general', { command: 'system', parameters: { action: 'volume_down' } }));
      return;
    }

    // --- APP LAUNCHING PROTOCOL ---
    if (lowerCmd.includes("open") || lowerCmd.includes("launch")) {
      const appName = lowerCmd.replace("open", "").replace("launch", "").trim();



      jarvisRespond(`Accessing ${appName}.`, () => callBackend('/action/general', { command: 'open_app', parameters: { app_name: appName } }));
      return;
    }



    // legacy
    if (lowerCmd.includes("camera") || lowerCmd.includes("guide")) {
      await speak("Visual systems online.");
      window.location.href = "/?mode=camera-guide";
      return;
    }

    // Default Fallback
    await speak(`I heard ${cmd}.`);
  };

  return (
    <div className="voice-container" onClick={() => startListening()}>
      <div className="header">
        <div className="brand">PERSONAPLEX</div>
        <div className="sub-brand">NVIDIA INTELLIGENCE</div>
      </div>

      <div className={`orb ${status}`}></div>

      <div className="transcript">
        "{transcript}"
      </div>

      <div className="response">
        {response}
      </div>

      <button className="back-btn" onClick={onBack}>✕</button>

      <style>{`
        .voice-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: radial-gradient(circle at center, #1e293b 0%, #000000 100%);
          color: white;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }
        .header {
          position: absolute;
          top: 2rem;
          text-align: center;
          opacity: 0.7;
        }
        .brand {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.2rem;
          background: linear-gradient(to right, #4ade80, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sub-brand {
          font-size: 0.6rem;
          letter-spacing: 0.3rem;
          margin-top: 0.5rem;
        }
        .orb {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(45deg, #06b6d4, #3b82f6);
          box-shadow: 0 0 50px #3b82f6;
          transition: all 0.5s ease;
          animation: breathe 4s infinite ease-in-out;
        }
        .orb.listening {
          transform: scale(1.1);
          box-shadow: 0 0 80px #a855f7;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          animation: pulse 1s infinite;
        }
        .orb.speaking {
          transform: scale(1.2);
          box-shadow: 0 0 80px #22c55e;
          background: linear-gradient(45deg, #22c55e, #10b981);
          animation: vibrate 0.2s infinite;
        }
        .transcript {
          margin-top: 3rem;
          font-size: 1.2rem;
          opacity: 0.6;
          min-height: 1.5rem;
        }
        .response {
          margin-top: 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          text-align: center;
          max-width: 80%;
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
        .back-btn {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
          70% { box-shadow: 0 0 0 30px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        @keyframes vibrate {
          0% { transform: translate(0,0) scale(1.2); }
          25% { transform: translate(1px,1px) scale(1.2); }
          50% { transform: translate(-1px,-1px) scale(1.2); }
          75% { transform: translate(1px,-1px) scale(1.2); }
          100% { transform: translate(0,0) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
