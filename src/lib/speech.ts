type VoiceLike = Pick<SpeechSynthesisVoice, 'default' | 'lang' | 'localService' | 'name' | 'voiceURI'>;

type SpeechPlatform = 'android' | 'apple' | 'windows' | 'other';

const SMALL_KANA = new Set([
  'ゃ',
  'ゅ',
  'ょ',
  'ぁ',
  'ぃ',
  'ぅ',
  'ぇ',
  'ぉ',
  'ゎ',
  'ャ',
  'ュ',
  'ョ',
  'ァ',
  'ィ',
  'ゥ',
  'ェ',
  'ォ',
  'ヮ',
]);
const VOICELESS_ONSET_KANA = new Set([
  'か',
  'き',
  'く',
  'け',
  'こ',
  'さ',
  'し',
  'す',
  'せ',
  'そ',
  'た',
  'ち',
  'つ',
  'て',
  'と',
  'は',
  'ひ',
  'ふ',
  'へ',
  'ほ',
  'ぱ',
  'ぴ',
  'ぷ',
  'ぺ',
  'ぽ',
  'カ',
  'キ',
  'ク',
  'ケ',
  'コ',
  'サ',
  'シ',
  'ス',
  'セ',
  'ソ',
  'タ',
  'チ',
  'ツ',
  'テ',
  'ト',
  'ハ',
  'ヒ',
  'フ',
  'ヘ',
  'ホ',
  'パ',
  'ピ',
  'プ',
  'ペ',
  'ポ',
]);
const DEVOICEABLE_MORA = new Set([
  'き',
  'く',
  'し',
  'す',
  'ち',
  'つ',
  'ひ',
  'ふ',
  'ぴ',
  'ぷ',
  'キ',
  'ク',
  'シ',
  'ス',
  'チ',
  'ツ',
  'ヒ',
  'フ',
  'ピ',
  'プ',
]);

const PLATFORM_VOICE_NAMES: Record<SpeechPlatform, string[]> = {
  apple: ['kyoko', 'otoya', 'siri kyoko', 'siri otoya', 'eddy', 'flo', 'reed', 'rocko', 'sandy', 'shelley'],
  android: ['google 日本語', 'google japanese', 'google 日本人', '日本語', 'ja-jp-x-jad-local', 'ja-jp-x-jac-local'],
  windows: ['nanami', 'haruka', 'ayumi', 'microsoft'],
  other: ['kyoko', 'otoya', 'google 日本語', 'nanami', 'haruka'],
};

let cachedJapaneseVoice: SpeechSynthesisVoice | null = null;
let isVoiceWarmupAttached = false;
let pendingSpeakTimer: number | null = null;
let lastSpeakRequestedAt = 0;
let lastSpeakText = '';

function hasSpeechSupport() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function toKatakana(text: string) {
  return text.replace(/[\u3041-\u3096]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) + 0x60),
  );
}

function isKanaOnly(text: string) {
  return /^[\u3041-\u3096\u30A1-\u30FAー]+$/.test(text);
}

function splitIntoMora(text: string) {
  const morae: string[] = [];

  for (const character of text) {
    if (SMALL_KANA.has(character) && morae.length > 0) {
      morae[morae.length - 1] += character;
      continue;
    }

    morae.push(character);
  }

  return morae;
}

function beginsWithVoicelessKana(mora: string) {
  return VOICELESS_ONSET_KANA.has(mora[0] ?? '');
}

function shouldInsertLearnerPause(currentMora: string, nextMora: string | undefined) {
  if (!nextMora) {
    return false;
  }

  return DEVOICEABLE_MORA.has(currentMora) && beginsWithVoicelessKana(nextMora);
}

export function formatJapaneseSpeechText(text: string) {
  if (!isKanaOnly(text)) {
    return text;
  }

  const katakanaText = toKatakana(text);
  const morae = splitIntoMora(katakanaText);

  return morae
    .map((mora, index) => (shouldInsertLearnerPause(mora, morae[index + 1]) ? `${mora} ` : mora))
    .join('');
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
  const voice = selectBestJapaneseVoice(voices) ?? cachedJapaneseVoice;
  const utterance = new SpeechSynthesisUtterance(formatJapaneseSpeechText(text));

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

function clearPendingSpeakTimer() {
  if (pendingSpeakTimer === null || typeof window === 'undefined') {
    return;
  }

  window.clearTimeout(pendingSpeakTimer);
  pendingSpeakTimer = null;
}

function queueSpeak(text: string, delayMs = 0) {
  if (!hasSpeechSupport()) {
    return false;
  }

  clearPendingSpeakTimer();

  if (delayMs <= 0 || typeof window === 'undefined') {
    return speakNow(text);
  }

  pendingSpeakTimer = window.setTimeout(() => {
    pendingSpeakTimer = null;
    speakNow(text);
  }, delayMs);

  return true;
}

function refreshCachedJapaneseVoice() {
  if (!hasSpeechSupport()) {
    cachedJapaneseVoice = null;
    return null;
  }

  cachedJapaneseVoice = selectBestJapaneseVoice(window.speechSynthesis.getVoices());
  return cachedJapaneseVoice;
}

export function primeJapaneseVoices() {
  if (!hasSpeechSupport()) {
    return false;
  }

  const synth = window.speechSynthesis;
  refreshCachedJapaneseVoice();

  if (cachedJapaneseVoice || isVoiceWarmupAttached) {
    return true;
  }

  const handleVoicesChanged = () => {
    refreshCachedJapaneseVoice();

    if (cachedJapaneseVoice) {
      synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
      isVoiceWarmupAttached = false;
    }
  };

  isVoiceWarmupAttached = true;
  synth.addEventListener?.('voiceschanged', handleVoicesChanged);
  synth.getVoices();
  return true;
}

export function canSpeakJapanese() {
  if (!hasSpeechSupport()) {
    return false;
  }

  primeJapaneseVoices();
  return true;
}

export function speakJapanese(text: string) {
  if (!hasSpeechSupport()) {
    return false;
  }

  const now = Date.now();
  refreshCachedJapaneseVoice();
  primeJapaneseVoices();
  const synth = window.speechSynthesis;
  const isImmediateReplay = text === lastSpeakText && now - lastSpeakRequestedAt < 1500;
  const needsRestartDelay = synth.speaking || synth.pending || isImmediateReplay;

  lastSpeakText = text;
  lastSpeakRequestedAt = now;

  if (needsRestartDelay) {
    synth.cancel();
    return queueSpeak(text, 80);
  }

  clearPendingSpeakTimer();
  return speakNow(text);
}
