function hasSpeechSupport() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function getJapaneseVoice(synth: SpeechSynthesis) {
  const voices = synth.getVoices();

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith('ja-jp')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('ja')) ??
    null
  );
}

export function canSpeakJapanese() {
  return hasSpeechSupport();
}

export function speakJapanese(text: string) {
  if (!hasSpeechSupport()) {
    return false;
  }

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getJapaneseVoice(synth);

  utterance.lang = 'ja-JP';
  utterance.rate = 0.95;

  if (voice) {
    utterance.voice = voice;
  }

  synth.cancel();
  synth.speak(utterance);
  return true;
}
