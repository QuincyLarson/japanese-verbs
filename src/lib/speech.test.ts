import { selectBestJapaneseVoice } from './speech';

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
