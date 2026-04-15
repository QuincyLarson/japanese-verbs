import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AnnexPage } from '../pages/AnnexPage';
import { BrowsePage } from '../pages/BrowsePage';
import { OverviewPage } from '../pages/OverviewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { StatsPage } from '../pages/StatsPage';
import { StudyPage } from '../pages/StudyPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/index" element={<BrowsePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/annex" element={<AnnexPage />} />
      </Route>
    </Routes>
  );
}
