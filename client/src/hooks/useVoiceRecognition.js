import { useState, useEffect, useRef, useCallback } from 'react';
import { speakResponse, cancelSpeech } from '../services/speechService.js';

// Check browser support for Web Speech API
const SpeechRecognition = typeof window !== 'undefined' 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
  : null;

export const useVoiceRecognition = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(options.language || 'en-IN');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Capture discrete sentence
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        if (final) {
          setTranscript(final.trim());
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (event) => {
        const errType = event.error;
        console.warn('Speech recognition error:', errType);

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setError('Microphone permission is blocked. Please allow microphone access in your browser settings.');
        } else if (errType === 'no-speech') {
          setError("I didn't hear anything. Please try again.");
        } else if (errType === 'audio-capture') {
          setError('No microphone was detected on your device. Please ensure a microphone is connected.');
        } else if (errType === 'network') {
          setError('Network error encountered with speech recognition service.');
        } else if (errType === 'aborted') {
          // Normal when aborted by code
          setError(null);
        } else if (errType === 'language-not-supported') {
          setError('Selected language is not supported by your browser.');
        } else {
          setError(`Speech error: ${errType}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Voice recognition is not supported in this browser. Please use Chrome or the text input.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser. Please use Chrome or the text input.');
      return;
    }

    try {
      // Cancel any ongoing TTS before opening mic to avoid audio feedback
      cancelSpeech();
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.lang = language || 'en-IN';
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  /**
   * Speak back feedback to user via Web SpeechSynthesis API
   */
  const speakText = useCallback((text) => {
    speakResponse(text, language);
  }, [language]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetTranscript,
    speakText,
    speakResponse,
    cancelSpeech,
  };
};

export default useVoiceRecognition;
