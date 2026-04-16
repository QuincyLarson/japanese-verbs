type VoiceLike = Pick<SpeechSynthesisVoice, 'default' | 'lang' | 'localService' | 'name' | 'voiceURI'>;

type SpeechPlatform = 'android' | 'apple' | 'windows' | 'other';

const PLATFORM_VOICE_NAMES: Record<SpeechPlatform, string[]> = {
  apple: ['kyoko', 'otoya', 'siri kyoko', 'siri otoya', 'eddy', 'flo', 'reed', 'rocko', 'sandy', 'shelley'],
  android: ['google 日本語', 'google japanese', 'google 日本人', '日本語', 'ja-jp-x-jad-local', 'ja-jp-x-jac-local'],
  windows: ['nanami', 'haruka', 'ayumi', 'microsoft'],
  other: ['kyoko', 'otoya', 'google 日本語', 'nanami', 'haruka'],
};

function hasSpeechSupport() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function getPlatformHint(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent): SpeechPlatform {
  const normalized = userAgent.toLowerCase();

  if (/android/.test(normalized)) {
    return 'android';
  }

  if (/iphone|ipad|ipod|macintosh|mac os x/.test(normalized)) {
    return 'apple';
  }

  if (/windows/.test(normalized)) {
    return 'windows';
  }

  return 'other';
}

function scoreVoiceForPlatform(voice: VoiceLike, platform: SpeechPlatform) {
  const normalizedLang = voice.lang.toLowerCase();

  if (!normalizedLang.startsWith('ja')) {
    return Number.NEGATIVE_INFINITY;
  }

  const normalizedName = voice.name.toLowerCase();
  const normalizedUri = voice.voiceURI.toLowerCase();
  let score = normalizedLang === 'ja-jp' ? 320 : 280;

  if (voice.localService) {
    score += 35;
  }

  if (voice.default) {
    score += 20;
  }

  if (normalizedName.includes('japanese') || normalizedName.includes('日本')) {
    score += 10;
  }

  PLATFORM_VOICE_NAMES[platform].forEach((preferred, index) => {
    if (normalizedName.includes(preferred) || normalizedUri.includes(preferred)) {
      score += 140 - index * 8;
    }
  });

  if (platform === 'apple' && (normalizedUri.includes('com.apple') || normalizedName === 'kyoko')) {
    score += 40;
  }

  if (platform === 'android' && normalizedName.includes('google')) {
    score += 30;
  }

  if (platform === 'windows' && normalizedName.includes('microsoft')) {
    score += 30;
  }

  return score;
}

export function selectBestJapaneseVoice(
  voices: readonly VoiceLike[],
  platform = getPlatformHint(),
) {
  return voices
    .map((voice) => ({
      voice,
      score: scoreVoiceForPlatform(voice, platform),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => right.score - left.score)[0]?.voice ?? null;
}

function speakNow(text: string) {
  if (!hasSpeechSupport()) {
    return false;
  }

  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice = selectBestJapaneseVoice(voices);
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = 'ja-JP';
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (voice) {
    utterance.voice = voice;
  }

  synth.cancel();
  synth.resume();
  synth.speak(utterance);
  return true;
}

export function canSpeakJapanese() {
  if (!hasSpeechSupport()) {
    return false;
  }

  window.speechSynthesis.getVoices();
  return true;
}

export function speakJapanese(text: string) {
  if (!hasSpeechSupport()) {
    return false;
  }

  const synth = window.speechSynthesis;
  const existingVoices = synth.getVoices();

  if (existingVoices.length > 0) {
    return speakNow(text);
  }

  let finished = false;

  const finalize = () => {
    if (finished) {
      return;
    }

    finished = true;
    synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
    speakNow(text);
  };

  const handleVoicesChanged = () => {
    finalize();
  };

  synth.addEventListener?.('voiceschanged', handleVoicesChanged);
  window.setTimeout(finalize, 350);
  synth.getVoices();
  return true;
}
