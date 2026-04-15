import { Link } from 'react-router-dom';
import { InfoPage } from '../components/InfoPage';

export function BrowsePage() {
  return (
    <InfoPage
      eyebrow="Browse"
      title="Verb reference"
      description="Searchable verb details, alternate readings, and enabled forms will live here once the study state and detail cards are wired."
    >
      <section className="panel stack">
        <p className="label">Next milestone</p>
        <p className="muted-text">
          The browse view will expose the seed deck in an inspection-friendly format with compact inflection blocks.
        </p>
        <Link className="block-link" to="/study">
          Open study workspace
        </Link>
      </section>
    </InfoPage>
  );
}
