import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateCharacter } from './pages/CreateCharacter';
import { CharacterSheet } from './pages/CharacterSheet';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/criar" element={<CreateCharacter />} />
      <Route path="/personagem/:id" element={<CharacterSheet />} />

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
      </Route>
    </Routes>
  );
}

export default App;
