import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './LanguageSelector';
import './VoiceSearch.css';

// Language map for speech recognition
const LANG_MAP = {
    en: 'en-US',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
};

const VoiceSearch = ({ onResult }) => {
    const navigate = useNavigate();
    const { lang } = useTranslation();

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimText, setInterimText] = useState('');
    const [error, setError] = useState('');
    const [supported, setSupported] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechAPI) {
            setSupported(false);
            return;
        }

        const rec = new SpeechAPI();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = LANG_MAP[lang] || 'en-US';

        rec.onstart = () => {
            setIsListening(true);
            setTranscript('');
            setInterimText('');
            setError('');
        };

        rec.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const res = event.results[i];
                if (res.isFinal) final += res[0].transcript;
                else interim += res[0].transcript;
            }
            if (interim) setInterimText(interim);
            if (final) {
                setTranscript(final);
                setInterimText('');
                handleVoiceResult(final);
            }
        };

        rec.onerror = (event) => {
            const msgs = {
                'not-allowed': 'Microphone access denied. Please allow mic permission.',
                'no-speech':   'No speech detected. Please try again.',
                'network':     'Network error. Please check your connection.',
            };
            setError(msgs[event.error] || `Error: ${event.error}`);
            setIsListening(false);
        };

        rec.onend = () => {
            setIsListening(false);
            timeoutRef.current = setTimeout(() => {
                if (!transcript) setShowModal(false);
            }, 2000);
        };

        recognitionRef.current = rec;

        return () => {
            clearTimeout(timeoutRef.current);
            rec.abort();
        };
    }, [lang]);

    // ✅ FIXED: Clean text before using
    const handleVoiceResult = async (text) => {
        const cleanText = text
            .trim()
            .replace(/[.,!?।]/g, '')   // remove punctuation
            .replace(/\s+/g, ' ')      // remove extra spaces
            .toLowerCase();            // lowercase

        try {
            const response = await fetch('/api/search/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanText }) // ✅ cleaned text
            });

            const data = await response.json();

            if (data.action === 'search') {
                navigate(`/search?q=${encodeURIComponent(data.query)}`);
            } else if (data.action === 'navigate') {
                navigate(data.path);
            } else if (data.action === 'filter') {
                onResult?.(data);
            }
        } catch {
            // ✅ Fallback also uses clean text
            setTimeout(() => {
                navigate(`/search?q=${encodeURIComponent(cleanText)}`);
                setShowModal(false);
            }, 800);
        }
    };

    const startListening = () => {
        if (!recognitionRef.current || !supported) return;
        clearTimeout(timeoutRef.current);
        setShowModal(true);
        setError('');
        try {
            recognitionRef.current.lang = LANG_MAP[lang] || 'en-US';
            recognitionRef.current.start();
        } catch (e) {
            console.log('Recognition error:', e);
        }
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const closeModal = () => {
        stopListening();
        setShowModal(false);
        setTranscript('');
        setInterimText('');
        setError('');
    };

    if (!supported) return null;

    return (
        <>
            {/* ── MIC BUTTON ── */}
            <button
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop listening' : 'Voice Search'}
                aria-label="Voice Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            </button>

            {/* ── OVERLAY ── */}
            {showModal && (
                <div className="voice-overlay" onClick={closeModal}>
                    <div className="voice-modal" onClick={e => e.stopPropagation()}>

                        <button className="voice-close" onClick={closeModal}>✕</button>

                        <div className={`voice-animation-wrap ${isListening ? 'active' : ''}`}>
                            <div className="mic-circle">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                </svg>
                            </div>
                        </div>

                        <div className="voice-status">
                            {error ? (
                                <p className="voice-error-text">⚠️ {error}</p>
                            ) : transcript ? (
                                <>
                                    <p className="voice-result">✅ "{transcript}"</p>
                                    <p className="voice-searching">Searching...</p>
                                </>
                            ) : (
                                <>
                                    <p className="voice-listening-text">
                                        {isListening ? 'Listening...' : 'Tap mic to speak'}
                                    </p>
                                    <p className="voice-interim">{interimText}</p>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceSearch;





