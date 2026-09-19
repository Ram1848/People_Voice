/**
 * Dedicated Browser Text-to-Speech (TTS) Service
 * 
 * Implements Web Speech Synthesis API with:
 * - Pre-speech cancellation with Chromium tick safeguard
 * - Dynamic voice loading via getVoices() & voiceschanged listener
 * - Intelligent locale voice selection with natural fallbacks
 * - Natural rate (0.95), full volume (1.0), and pitch (1.0)
 * - Comprehensive error handling and resume-from-pause safeguards
 */

let cachedVoices = [];
let isVoiceLoaded = false;

const loadVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
    isVoiceLoaded = true;
  }
  return cachedVoices;
};

// Initialize voice cache immediately and on voiceschanged event
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

/**
 * Select the most suitable voice available in the browser for the given language code.
 * E.g. 'en-IN', 'te-IN', 'hi-IN'
 */
export const findBestVoice = (targetLang = 'en-IN') => {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  const normalizedTarget = (targetLang || 'en-IN').toLowerCase().replace('_', '-');
  const langPrefix = normalizedTarget.split('-')[0];

  // 1. Exact match (e.g., 'en-IN' === 'en-in')
  let match = voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-') === normalizedTarget);
  if (match) return match;

  // 2. Prefix match in region (e.g. 'en-in' or 'te')
  match = voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(normalizedTarget));
  if (match) return match;

  // 3. Language group match (e.g., 'te' -> any telugu voice)
  match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
  if (match) return match;

  // 4. Fallback for Indian context: prefer 'en-IN' voice if target was Telugu/Hindi but system lacks it
  if (langPrefix === 'te' || langPrefix === 'hi') {
    const indianEnglish = voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-').includes('en-in'));
    if (indianEnglish) return indianEnglish;
  }

  // 5. Default browser voice or first English voice
  const englishVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
  const defaultVoice = voices.find(v => v.default);

  return englishVoice || defaultVoice || voices[0] || null;
};

/**
 * Reusable function to speak a response text aloud.
 * 
 * @param {string} text - Spoken message to articulate.
 * @param {string} language - Target language code (e.g. 'en-IN', 'te-IN').
 * @param {object} options - Callbacks: onStart, onEnd, onError
 */
export const speakResponse = (text, language = 'en-IN', options = {}) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Text-to-Speech is not supported in this browser environment.');
    return;
  }

  const cleanText = (text || '').trim();
  if (!cleanText) return;

  try {
    // 1. Cancel any previous speech to avoid overlapping audio
    window.speechSynthesis.cancel();

    // 2. Unpause synthesizer if left in paused state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 3. Use microtick delay (35ms) to circumvent Chromium cancel-then-speak queue drop bug
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Natural rate around 0.9–1.0 as required
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Select voice and target language
        const targetLang = language || 'en-IN';
        const bestVoice = findBestVoice(targetLang);

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang || targetLang;
        } else {
          utterance.lang = targetLang;
        }

        utterance.onstart = () => {
          if (options.onStart) options.onStart();
        };

        utterance.onend = () => {
          if (options.onEnd) options.onEnd();
        };

        utterance.onerror = (event) => {
          // 'canceled' or 'interrupted' errors happen normally when user starts speaking or clicks cancel
          if (event.error !== 'canceled' && event.error !== 'interrupted') {
            console.error('SpeechSynthesisUtterance error:', event.error);
          }
          if (options.onError) options.onError(event);
        };

        window.speechSynthesis.speak(utterance);
      } catch (innerErr) {
        console.error('Failed to trigger speech synthesis:', innerErr);
        if (options.onError) options.onError(innerErr);
      }
    }, 35);
  } catch (err) {
    console.error('Text-to-Speech execution exception:', err);
    if (options.onError) options.onError(err);
  }
};

/**
 * Cancel any ongoing speech immediately.
 */
export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
};

export default {
  speakResponse,
  cancelSpeech,
  findBestVoice,
};
