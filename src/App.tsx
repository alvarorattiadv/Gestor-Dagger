import { Routes, Route, Navigate } from 'react-router-dom';
import { CampaignLayout } from './campaign/CampaignLayout';
import { CampaignHome } from './campaign/pages/CampaignHome';
import { CityList } from './campaign/pages/CityList';
import { CityDetail } from './campaign/pages/CityDetail';
import { NpcsFactions } from './campaign/pages/NpcsFactions';
import { Templars } from './campaign/pages/Templars';
import { Artifacts } from './campaign/pages/Artifacts';
import { Sessions } from './campaign/pages/Sessions';
import { Threads } from './campaign/pages/Threads';
import { Party } from './campaign/pages/Party';
import { CharacterDetail } from './campaign/pages/CharacterDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/campanha" replace />} />
      <Route path="/criar" element={<Navigate to="/campanha" replace />} />
      <Route path="/personagem/:id" element={<Navigate to="/campanha" replace />} />

      <Route path="/campanha" element={<CampaignLayout />}>
        <Route index element={<CampaignHome />} />
        <Route path="cidades" element={<CityList />} />
        <Route path="cidades/:cityId" element={<CityDetail />} />
        <Route path="npcs-faccoes" element={<NpcsFactions />} />
        <Route path="templarios" element={<Templars />} />
        <Route path="artefatos" element={<Artifacts />} />
        <Route path="sessoes" element={<Sessions />} />
        <Route path="fios" element={<Threads />} />
        <Route path="grupo" element={<Party />} />
        <Route path="grupo/:characterId" element={<CharacterDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
