import { formatJapaneseSpeechText, selectBestJapaneseVoice, speakJapanese } from './speech';

class MockSpeechSynthesisUtterance {
  lang = '';
  pitch = 1;
  rate = 1;
  text: string;
  voice?: SpeechSynthesisVoice;
  volume = 1;

  constructor(text: string) {
    this.text = text;
  }
}

describe('selectBestJapaneseVoice', () => {
  it('prefers Kyoko on Apple platforms when available', () => {
    const selected = selectBestJapaneseVoice(
      [
        {
          name: 'Google 日本語',
          lang: 'ja-JP',
          voiceURI: 'google-ja-jp',
          default: false,
          localService: false,
        },
        {
          name: 'Kyoko',
          lang: 'ja-JP',
          voiceURI: 'com.apple.speech.synthesis.voice.kyoko',
          default: false,
          localService: true,
        },
      ],
      'apple',
    );

    expect(selected?.name).toBe('Kyoko');
  });

  it('prefers Google Japanese on Android when available', () => {
    const selected = selectBestJapaneseVoice(
      [
        {
          name: 'Kyoko',
          lang: 'ja-JP',
          voiceURI: 'com.apple.speech.synthesis.voice.kyoko',
          default: false,
          localService: true,
        },
        {
          name: 'Google 日本語',
          lang: 'ja-JP',
          voiceURI: 'google-ja-jp',
          default: true,
          localService: false,
        },
      ],
      'android',
    );

    expect(selected?.name).toBe('Google 日本語');
  });
});

describe('formatJapaneseSpeechText', () => {
  it('adds a learner pause in devoicing-prone sequences like すすむ', () => {
    expect(formatJapaneseSpeechText('すすむ')).toBe('ス スム');
    expect(formatJapaneseSpeechText('すすめる')).toBe('ス スメル');
  });

  it('leaves non-problematic kana readings continuous', () => {
    expect(formatJapaneseSpeechText('よむ')).toBe('ヨム');
    expect(formatJapaneseSpeechText('たべる')).toBe('タベル');
  });

  it('does not rewrite mixed or kanji text', () => {
    expect(formatJapaneseSpeechText('進む')).toBe('進む');
    expect(formatJapaneseSpeechText('見る(みる)')).toBe('見る(みる)');
  });
});

describe('speakJapanese', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('speaks normalized learner-friendly kana for devoicing-prone readings', () => {
    const cancel = vi.fn();
    const getVoices = vi.fn(() => []);
    const resume = vi.fn();
    const speak = vi.fn();
    const synth = {
      speaking: false,
      pending: false,
      cancel,
      getVoices,
      resume,
      speak,
    };

    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
    vi.stubGlobal(
      'window',
      Object.assign(globalThis.window ?? {}, {
        speechSynthesis: synth,
        SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
      }),
    );

    expect(speakJapanese('すすむ')).toBe(true);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0]?.[0]?.text).toBe('ス スム');
  });

  it('queues a short restart delay when replay is requested while speech is active', () => {
    vi.useFakeTimers();

    const cancel = vi.fn();
    const getVoices = vi.fn(() => []);
    const resume = vi.fn();
    const speak = vi.fn();
    const synth = {
      speaking: true,
      pending: false,
      cancel: () => {
        cancel();
        synth.speaking = false;
      },
      getVoices,
      resume,
      speak,
    };

    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
    vi.stubGlobal(
      'window',
      Object.assign(globalThis.window ?? {}, {
        speechSynthesis: synth,
        SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
      }),
    );

    expect(speakJapanese('よむ')).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).not.toHaveBeenCalled();

    vi.advanceTimersByTime(80);

    expect(resume).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
  });
});
