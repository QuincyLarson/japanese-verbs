import { InfoPage } from '../components/InfoPage';

export function StatsPage() {
  return (
    <InfoPage
      eyebrow="Stats"
      title="Progress diagnostics"
      description="This view will summarize introduced verbs, burned items, weakest families, and recent trouble spots."
    >
      <section className="panel stack">
        <p className="label">Planned outputs</p>
        <ul className="compact-list">
          <li>Total verbs introduced and burned</li>
          <li>Accuracy by form family</li>
          <li>Weakest て-form pattern buckets</li>
        </ul>
      </section>
    </InfoPage>
  );
}
