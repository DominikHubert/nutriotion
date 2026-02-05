import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

export function VoiceInput({ onTranscript }) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!isSupported) {
            alert("Voice input is not supported in this browser. Try Chrome or Edge.");
            return;
        }

        if (isListening) {
            // Stop logic is handled by 'end' event usually, but we can force stop
            // However, typical usage for simple command is single shot
            // We'll let the recognition instance handle it or create a new one each time
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'de-DE'; // Default to German based on user language context
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
        };

        recognition.onspeechend = () => {
            recognition.stop();
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                alert("Microphone access denied.");
            }
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <button
            onClick={toggleListening}
            className={`p-3 rounded-lg transition-colors flex items-center justify-center ${isListening
                    ? 'bg-red-500/20 text-red-500 animate-pulse'
                    : 'bg-slate-900 border border-slate-700 text-gray-400 hover:text-white hover:border-slate-500'
                }`}
            title="Speak food (e.g. '2 Eier und ein Toast')"
        >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
    );
}
