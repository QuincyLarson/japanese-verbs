import { InfoPage } from '../components/InfoPage';

export function StudyPage() {
  return (
    <InfoPage
      eyebrow="Study"
      title="Review workspace"
      description="The reveal and self-grade loop will be implemented here with filter presets, a constrained card workspace, and deterministic scheduling."
    >
      <section className="panel stack">
        <p className="label">Upcoming</p>
        <ul className="compact-list">
          <li>Show a Japanese form first</li>
          <li>Reveal base verb, reading, meaning, and inflection bullets</li>
          <li>Self-grade with Again, Hard, Good, or Easy</li>
        </ul>
      </section>
    </InfoPage>
  );
}
