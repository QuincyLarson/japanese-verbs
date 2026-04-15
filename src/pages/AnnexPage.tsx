import { InfoPage } from '../components/InfoPage';

export function AnnexPage() {
  return (
    <InfoPage
      eyebrow="Reference"
      title="する verb annex"
      description="The core deck excludes noun-plus-する verbs. This page remains a placeholder for later reference material."
    >
      <section className="panel stack">
        <p className="label">Planned use</p>
        <p className="muted-text">
          Keep the main study loop focused on orthographic core verbs first. Add common する compounds later without
          merging them into the V1 scheduler.
        </p>
      </section>
    </InfoPage>
  );
}
