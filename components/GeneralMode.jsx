import React from 'react';

const GeneralMode = ({ mode, onBack }) => {
  const WHATSAPP_URL = "ENTER YOUR WEBHOOK";
  const PARALYSIS_URL = "ENTER YOUR WEBHOOK";

  const handleRedirect = () => {
    if (mode === 'paralysis') {
      window.location.href = PARALYSIS_URL;
    } else {
      window.location.href = WHATSAPP_URL;
    }
  };

  const isParalysis = mode === 'paralysis';
  const title = isParalysis ? "Paralysis Assist" : "General Medical Assist";
  const buttonText = isParalysis ? "Launch Eye Tracking" : "Contact Medical Support";

  return (
    <div className={`general-container ${isParalysis ? 'paralysis-theme' : 'general-theme'}`}>
      <div className="content-wrapper">
        <h1>{title}</h1>
        <p>Tap the button below to connect with our team on WhatsApp immediately.</p>

        <button
          className="action-button"
          onClick={handleRedirect}
          aria-label={buttonText}
        >
          <span className="icon-large">📞</span>
          {buttonText}
        </button>
      </div>

      <button className="back-btn" onClick={onBack}>Back</button>

      <style>{`
        .general-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          text-align: center;
          animation: slideIn 0.5s ease-out;
        }
        .general-theme {
          background-color: var(--general-mode-bg);
          color: var(--general-text);
        }
        .paralysis-theme {
          background-color: #fce7f3; /* Light pink/red for urgency */
          color: #881337;
        }
        .content-wrapper {
          max-width: 600px;
          background: rgba(255,255,255,0.8);
          padding: 3rem;
          border-radius: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.25rem;
          margin-bottom: 3rem;
          opacity: 0.8;
        }
        .action-button {
          width: 100%;
          padding: 2rem;
          font-size: 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
          background: ${isParalysis ? '#db2777' : '#2563eb'};
          color: white;
          font-weight: bold;
        }
        .action-button:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }
        .action-button:active {
          transform: scale(0.98);
        }
        .icon-large {
          font-size: 2rem;
        }
        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid currentColor;
          border-radius: 0.5rem;
          font-weight: bold;
          opacity: 0.7;
        }
        .back-btn:hover {
          opacity: 1;
        }
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GeneralMode;

