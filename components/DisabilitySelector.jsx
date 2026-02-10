import React from 'react';

const DisabilitySelector = ({ onSelectMode }) => {
  return (
    <div className="selector-container">
      <h1>Medical Assist</h1>
      <p>Please select your assistance mode</p>

      <div className="mode-grid">
        <button
          className="mode-card blind"
          onClick={() => onSelectMode('blind')}
          aria-label="Blind Assistance Mode"
        >
          <span className="icon">👁️‍🗨️</span>
          <h2>Blind Assist</h2>
          <p>Tap interactions & Voice guidance</p>
        </button>

        <button
          className="mode-card general"
          onClick={() => onSelectMode('general')}
          aria-label="General Medical Assist"
        >
          <span className="icon">🏥</span>
          <h2>General Assist</h2>
          <p>Medical support & Quick Actions</p>
        </button>

        <button
          className="mode-card paralysis"
          onClick={() => onSelectMode('paralysis')}
          aria-label="Paralysis Assistance Mode"
        >
          <span className="icon">♿</span>
          <h2>Paralysis Assist</h2>
          <p>Simplified touch & Assistance</p>
        </button>
      </div>

      <div className="share-section">
        <div className="share-card">
          <span className="icon-small">📱</span>
          <h2>Connect New Device</h2>
          <p>Scan to mirror this system on your mobile</p>
          <div className="qr-wrapper">
            <img src="/access_qr.png" alt="Access QR Code" className="qr-img" />
          </div>
          <p className="ip-hint">Ensure phone is on same Wi-Fi</p>
        </div>
      </div>

      <style>{`
        .selector-container {
          text-align: center;
          animation: fadeIn 1s ease-out;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .share-section {
          margin-top: 4rem;
          width: 100%;
          max-width: 400px;
        }
        .share-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          padding: 2rem;
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease;
        }
        .share-card:hover {
          transform: translateY(-5px);
          border-color: #60a5fa;
        }
        .qr-wrapper {
          background: white;
          padding: 1rem;
          border-radius: 1.5rem;
          display: inline-block;
          margin: 1.5rem 0;
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
        }
        .qr-img {
          width: 180px;
          height: 180px;
          display: block;
        }
        .icon-small {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .share-card h2 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
          color: white;
        }
        .share-card p {
          font-size: 0.9rem;
          margin-bottom: 0;
          color: #94a3b8;
        }
        .ip-hint {
          font-style: italic;
          opacity: 0.7;
          margin-top: 0.5rem !important;
        }
        h1 {
          font-size: 3.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        .main-hint {
          color: #94a3b8;
          margin-bottom: 3rem;
          font-size: 1.2rem;
        }
        .mode-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          width: 100%;
        }
        .mode-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 2.5rem;
          border-radius: 1.5rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
        }
        .mode-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.08);
          border-color: #60a5fa;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }
        .mode-card h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .mode-card p {
          color: #cbd5e1;
          margin-bottom: 0;
          font-size: 1rem;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DisabilitySelector;
