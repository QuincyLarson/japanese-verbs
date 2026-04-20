import { getInflectionExample } from './conjugation';
import type { VerbEntry } from '../types/verb';

const READ_ENTRY: Pick<VerbEntry, 'englishPrimary' | 'englishGlosses' | 'transitivity'> = {
  englishPrimary: 'read',
  englishGlosses: ['read'],
  transitivity: 'transitive',
};

describe('getInflectionExample', () => {
  it('builds short dictionary examples with a matching English line', () => {
    expect(
      getInflectionExample(
        READ_ENTRY,
        {
          jp: '読む',
          reading: 'よむ',
        },
        'dictionary',
      ),
    ).toEqual({
      japanese: 'もう読む。',
      english: 'I read it now.',
    });
  });

  it('builds te-form examples using progressive context', () => {
    expect(
      getInflectionExample(
        READ_ENTRY,
        {
          jp: '読んで',
          reading: 'よんで',
        },
        'te',
      ),
    ).toEqual({
      japanese: '今、読んでいる。',
      english: 'I am reading it now.',
    });
  });
});
