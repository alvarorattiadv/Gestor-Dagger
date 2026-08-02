import { useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store';
import { MapEditor } from '../components/MapEditor';
import { NewCityForm } from '../components/NewCityForm';

export function CampaignHome() {
  const campaign = useCampaignStore((s) => s.campaign);
  const updateWorldMap = useCampaignStore((s) => s.updateWorldMap);
  const addCity = useCampaignStore((s) => s.addCity);
  const navigate = useNavigate();

  function handleAddCity(name: string) {
    const city = addCity(name);
    navigate(`/campanha/cidades/${city.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Mapa Mundi</h2>
          <p className="text-sm text-stone-500">
            Clique em uma cidade para abrir a página dela. Use "Editar mapa" para adicionar cidades, ruínas, masmorras e outros pontos de interesse.
          </p>
        </div>
        <NewCityForm onCreate={handleAddCity} />
      </div>

      <MapEditor
        map={campaign.worldMap}
        onChange={(map) => updateWorldMap(() => map)}
        allowCityLink
        cities={campaign.cities}
        onNavigateCity={(cityId) => navigate(`/campanha/cidades/${cityId}`)}
        fixedBackgroundImage="/maps/daggerheart-world-map.png"
        fixedImageAspectRatio="2000/1542"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Cidades" value={campaign.cities.length} />
        <SummaryCard label="Fios ativos" value={campaign.threads.filter((t) => t.status === 'ativo').length} />
        <SummaryCard label="NPCs & Facções" value={campaign.globalNpcs.length + campaign.factions.length} />
        <SummaryCard label="Templários" value={campaign.templars.members.length} />
        <SummaryCard label="Artefatos" value={campaign.artifacts.length} />
        <SummaryCard label="Sessões" value={campaign.sessions.length} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm text-center">
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}
