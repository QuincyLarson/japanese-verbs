import { Link } from 'react-router-dom';
import { InfoPage } from '../components/InfoPage';

export function SettingsPage() {
  return (
    <InfoPage
      eyebrow="Settings"
      title="Local progress controls"
      description="Import, export, and reset controls will be implemented here once the persistence layer is wired."
    >
      <section className="panel stack">
        <p className="label">Storage model</p>
        <p className="muted-text">V1 stores progress in localStorage only and will support JSON import and export.</p>
        <Link className="block-link" to="/annex">
          Open annex placeholder
        </Link>
      </section>
    </InfoPage>
  );
}
