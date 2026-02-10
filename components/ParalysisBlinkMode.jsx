import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const ParalysisBlinkMode = ({ onBack }) => {
    const webcamRef = useRef(null);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [blinkState, setBlinkState] = useState({ left: false, right: false });
    const [status, setStatus] = useState("Loading AI Model...");
    const [eyeScores, setEyeScores] = useState({ L: 0, R: 0 });
    const tracker = useRef({ leftDown: false, rightDown: false, lastAction: 0, busy: false });

    const grid = [
        ['💧 WATER', '🍱 FOOD', '🚻 WASHROOM'],
        ['🏥 HEALTH CONCERN', '😖 PAIN', '💊 MEDICINE'],
        ['✅ YES', '❌ NO', '🗑️ CLEAR']
    ];

    useEffect(() => {
        // Force request camera permission immediately
        const requestCamera = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
                setStatus("Camera connected. Loading AI...");
            } catch (err) {
                console.error("Camera access denied:", err);
                setStatus("CAMERA ACCESS DENIED. Please allow camera.");
            }
        };
        requestCamera();

        const initAI = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                setFaceLandmarker(landmarker);
                setStatus("AI Ready: Use eyes to choose");
            } catch (error) {
                console.error("AI Init Error:", error);
                setStatus("AI ERROR: Check camera/wifi");
            }
        };
        initAI();
    }, []);

    const handleSelect = useCallback((index) => {
        if (tracker.current.busy) return;
        tracker.current.busy = true;

        const flatGrid = grid.flat();
        const action = flatGrid[index];
        const label = action.split(' ')[1] || action;

        if (action.includes('CLEAR')) {
            setMessage("");
        } else {
            setMessage(prev => (prev ? prev + " | " : "") + label);
            const utterance = new SpeechSynthesisUtterance("Requesting " + label);
            window.speechSynthesis.speak(utterance);
        }

        setSelectedIndex(0);

        // Lock selection for 2 seconds to prevent shouting
        setTimeout(() => {
            tracker.current.busy = false;
        }, 2000);
    }, [grid]);

    const indexRef = useRef(0);
    useEffect(() => {
        indexRef.current = selectedIndex;
    }, [selectedIndex]);

    useEffect(() => {
        let animationFrame;

        const detect = async () => {
            if (faceLandmarker && webcamRef.current?.video?.readyState === 4) {
                const results = faceLandmarker.detectForVideo(webcamRef.current.video, performance.now());

                if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                    const blendshapes = results.faceBlendshapes[0].categories;
                    const L = blendshapes.find(c => c.categoryName === "eyeBlinkLeft")?.score || 0;
                    const R = blendshapes.find(c => c.categoryName === "eyeBlinkRight")?.score || 0;

                    setEyeScores({ L, R });

                    const THRESHOLD = 0.4; // Responsive threshold
                    const NAV_COOLDOWN = 600;
                    const now = Date.now();

                    if (L < 0.2) tracker.current.leftDown = false;
                    if (R < 0.2) tracker.current.rightDown = false;

                    if (!tracker.current.busy && (now - tracker.current.lastAction > NAV_COOLDOWN)) {
                        const totalElements = grid.flat().length;

                        // 1. SELECT (Both eyes)
                        if (L > THRESHOLD && R > THRESHOLD && !tracker.current.leftDown && !tracker.current.rightDown) {
                            console.log("AI Gesture: SELECT");
                            handleSelect(indexRef.current);
                            tracker.current.leftDown = true;
                            tracker.current.rightDown = true;
                            tracker.current.lastAction = now;
                        }
                        // 2. PREVIOUS (Left eye only)
                        else if (L > THRESHOLD && R < 0.25 && !tracker.current.leftDown) {
                            console.log("AI Gesture: PREV");
                            setSelectedIndex(prev => (prev - 1 + totalElements) % totalElements);
                            tracker.current.leftDown = true;
                            tracker.current.lastAction = now;
                        }
                        // 3. NEXT (Right eye only)
                        else if (R > THRESHOLD && L < 0.25 && !tracker.current.rightDown) {
                            console.log("AI Gesture: NEXT");
                            setSelectedIndex(prev => (prev + 1) % totalElements);
                            tracker.current.rightDown = true;
                            tracker.current.lastAction = now;
                        }
                    }
                }
            }
            animationFrame = requestAnimationFrame(detect);
        };
        detect();
        return () => cancelAnimationFrame(animationFrame);
    }, [faceLandmarker, handleSelect, grid]);

    return (
        <div className="blink-container">
            <div className="hud">
                <div className="cam-box">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        className="mini-cam"
                        mirrored
                        videoConstraints={{
                            width: 640,
                            height: 480,
                            facingMode: "user"
                        }}
                    />
                    <div className="eye-meters">
                        <div className="meter"><div className="fill" style={{ width: `${eyeScores.L * 100}%` }}></div></div>
                        <div className="meter"><div className="fill" style={{ width: `${eyeScores.R * 100}%` }}></div></div>
                    </div>
                </div>
                <div className="status-badge">{status}</div>
            </div>

            <div className="output-panel">
                <div className="request-label">CURRENT REQUESTS</div>
                <div className="request-text">{message || "Awaiting input..."}</div>
            </div>

            <div className="phrases-grid">
                {grid.map((row, rIdx) => (
                    <div key={rIdx} className="phrase-row active-row">
                        {row.map((item, cIdx) => {
                            const isSelected = (rIdx * row.length + cIdx) === selectedIndex;
                            return (
                                <div key={cIdx} className={`phrase-cell ${isSelected ? 'selected' : ''}`}>
                                    {item}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="blink-footer">
                <div className="guide">
                    <div className="key"><span>LEFT EYE</span> PREV</div>
                    <div className="key"><span>RIGHT EYE</span> NEXT</div>
                    <div className="key"><span>BOTH EYES</span> SELECT</div>
                </div>
                <button className="exit-button" onClick={onBack}>EXIT MODE</button>
            </div>

            <style>{`
                .blink-container {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: #020617; color: white; display: flex; flex-direction: column;
                    align-items: center; padding: 2rem;
                }
                .hud {
                    position: absolute; top: 2rem; right: 2rem; display: flex; flex-direction: column; gap: 1rem;
                }
                .cam-box {
                    width: 180px; height: 135px; border-radius: 1rem; overflow: hidden;
                    border: 2px solid #3b82f6; position: relative;
                }
                .mini-cam { width: 100%; height: 100%; object-fit: cover; }
                .eye-meters {
                    position: absolute; bottom: 0; left: 0; width: 100%; display: flex; gap: 2px;
                    padding: 4px; background: rgba(0,0,0,0.5);
                }
                .meter { flex: 1; height: 6px; background: #334155; border-radius: 3px; overflow: hidden; }
                .fill { height: 100%; background: #60a5fa; transition: width 0.1s; }
                .status-badge {
                    background: #1e293b; padding: 0.5rem 1rem; border-radius: 2rem;
                    font-size: 0.8rem; text-align: center; border: 1px solid #3b82f6;
                }
                .output-panel {
                    width: 100%; max-width: 900px; margin-top: 2rem; text-align: center;
                }
                .request-label { font-size: 0.8rem; color: #64748b; letter-spacing: 2px; margin-bottom: 0.5rem; }
                .request-text {
                    font-size: 2.5rem; font-weight: 800; color: #60a5fa;
                    min-height: 4rem; padding: 1rem; background: rgba(255,255,255,0.02);
                    border-radius: 1rem;
                }
                .phrases-grid {
                    flex: 1; width: 100%; max-width: 1100px; display: flex; flex-direction: column;
                    justify-content: center; gap: 1rem; margin: 1rem 0;
                }
                .phrase-row { display: flex; gap: 1rem; opacity: 0.4; transition: all 0.3s; }
                .active-row { opacity: 1; transform: scale(1.02); }
                .phrase-cell {
                    flex: 1; height: 100px; background: #1e293b; border-radius: 1.25rem;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.1rem; font-weight: 600; text-align: center;
                    border: 2px solid transparent; transition: all 0.3s;
                    padding: 0.5rem;
                }
                @media (max-width: 600px) {
                    .blink-container { padding: 1rem; }
                    .request-text { font-size: 1.5rem; min-height: 3rem; }
                    .phrase-cell { height: 80px; font-size: 0.9rem; border-radius: 1rem; }
                    .hud { top: 1rem; right: 1rem; }
                    .cam-box { width: 120px; height: 90px; }
                    .guide { gap: 0.5rem; }
                    .key { font-size: 0.6rem; }
                    .key span { font-size: 0.8rem; }
                    .exit-button { padding: 0.6rem 1rem; font-size: 0.8rem; }
                    .phrases-grid { margin: 1rem 0; }
                }
                .selected {
                    background: #3b82f6 !important; transform: scale(1.1);
                    box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); z-index: 10;
                }
                .blink-footer { width: 100%; max-width: 900px; display: flex; justify-content: space-between; align-items: center; }
                .guide { display: flex; gap: 2rem; }
                .key { display: flex; flex-direction: column; font-size: 0.7rem; color: #94a3b8; }
                .key span { font-size: 1rem; color: white; font-weight: 700; margin-bottom: 0.2rem; }
                .exit-button {
                    background: #f43f5e; color: white; padding: 1rem 2rem;
                    border-radius: 1rem; font-weight: 800; cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default ParalysisBlinkMode;
