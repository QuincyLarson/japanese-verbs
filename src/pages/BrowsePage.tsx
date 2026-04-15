import { useDeferredValue, useMemo, useState, type FocusEvent } from 'react';
import { useAppState } from '../app/AppState';
import { getFormLabel, searchVerbs } from '../lib/stats';
import type { FormKey, VerbEntry } from '../types/verb';

function isNode(value: EventTarget | null): value is Node {
  return value instanceof Node;
}

function getVerbCharacterCount(value: string) {
  return Array.from(value.replace(/\s+/g, '')).length;
}

export function BrowsePage() {
  const { verbs, catalogStatus } = useAppState();
  const [query, setQuery] = useState('');
  const [activeVerbId, setActiveVerbId] = useState<string | null>(null);
  const [pinnedVerbId, setPinnedVerbId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Index</p>
        <h2>Loading the verb index.</h2>
      </section>
    );
  }

  const results = useMemo(() => searchVerbs(verbs, deferredQuery), [deferredQuery, verbs]);
  const groups = useMemo(
    () => ({
      short: results.filter((entry) => getVerbCharacterCount(entry.orthography) <= 3),
      long: results.filter((entry) => getVerbCharacterCount(entry.orthography) > 3),
    }),
    [results],
  );

  function activateVerb(entry: VerbEntry, pin = false) {
    setActiveVerbId(entry.id);
    if (pin) {
      setPinnedVerbId(entry.id);
    } else if (pinnedVerbId && pinnedVerbId !== entry.id) {
      setPinnedVerbId(null);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>, verbId: string) {
    if (isNode(event.relatedTarget) && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    if (pinnedVerbId === verbId) {
      return;
    }

    setActiveVerbId((current) => (current === verbId ? null : current));
  }

  return (
    <section className="page-stack">
      <section className="panel">
        <input
          aria-label="Search verbs"
          autoComplete="off"
          className="text-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="読む / よむ / yomu / read"
          spellCheck={false}
          type="search"
          value={query}
        />
      </section>

      <section className="index-screen stack-sm">
        {(['short', 'long'] as const).map((group) => (
          <div
            key={group}
            className={group === 'short' ? 'index-grid index-grid--short' : 'index-grid index-grid--long'}
            role="list"
            aria-label={group === 'short' ? 'Short verbs' : 'Longer verbs'}
          >
            {groups[group].map((entry) => {
              const isActive = activeVerbId === entry.id;
              const glossaryPreview = entry.englishGlosses.slice(0, 3).join(' / ');
              const sampleForms = (['dictionary', 'te', 'past'] as FormKey[])
                .map((formKey) => entry.forms[formKey])
                .filter((value): value is NonNullable<typeof value> => Boolean(value))
                .map((value) => value.jp)
                .join(' · ');

              return (
                <div
                  key={entry.id}
                  className="index-cell"
                  role="listitem"
                  onMouseEnter={() => activateVerb(entry)}
                  onMouseLeave={() => {
                    if (pinnedVerbId === entry.id) {
                      return;
                    }

                    setActiveVerbId((current) => (current === entry.id ? null : current));
                  }}
                  onBlur={(event) => handleBlur(event, entry.id)}
                >
                  <button
                    type="button"
                    className={
                      group === 'short'
                        ? isActive
                          ? 'index-expression index-expression--short is-active'
                          : 'index-expression index-expression--short'
                        : isActive
                          ? 'index-expression index-expression--long is-active'
                          : 'index-expression index-expression--long'
                    }
                    aria-expanded={isActive}
                    onFocus={() => activateVerb(entry)}
                    onClick={() => {
                      if (pinnedVerbId === entry.id) {
                        setPinnedVerbId(null);
                        setActiveVerbId(null);
                        return;
                      }

                      activateVerb(entry, true);
                    }}
                  >
                    {entry.orthography}
                  </button>

                  {isActive ? (
                    <div className="index-popover" role="dialog" aria-label={entry.orthography}>
                      <p className="index-popover__expression" lang="ja">
                        {entry.orthography}
                      </p>
                      <p className="index-popover__meta">
                        {entry.reading} · {entry.englishPrimary}
                      </p>
                      <div className="index-popover__summaries">
                        <p className="index-popover__summary">{glossaryPreview}</p>
                        <p className="index-popover__summary">
                          {entry.verbClass} · {entry.transitivity} · rank {entry.bccwjRank}
                        </p>
                      </div>
                      <p className="index-popover__origin">
                        Forms: {sampleForms || 'dictionary only'}
                      </p>
                      {entry.sameSpellingOtherReadings.length > 0 ? (
                        <p className="index-popover__origin">
                          Alternate reading: {entry.sameSpellingOtherReadings[0].reading}
                        </p>
                      ) : null}
                      <div className="pill-wrap">
                        {entry.allowedInflections.slice(0, 6).map((formKey) => (
                          <span className="pill" key={`${entry.id}-${formKey}`}>
                            {getFormLabel(formKey)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </section>
  );
}
