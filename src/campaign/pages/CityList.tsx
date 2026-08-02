import { Link, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { NewCityForm } from '../components/NewCityForm';

export function CityList() {
  const cities = useCampaignStore((s) => s.campaign.cities);
  const addCity = useCampaignStore((s) => s.addCity);
  const removeCity = useCampaignStore((s) => s.removeCity);
  const isGM = useRoleStore((s) => s.role === 'gm');
  const navigate = useNavigate();

  function handleAddCity(name: string) {
    const city = addCity(name);
    navigate(`/campanha/cidades/${city.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-900">Cidades</h2>
        <NewCityForm onCreate={handleAddCity} />
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-16 text-stone-500 bg-white border border-stone-200 rounded-xl space-y-3">
          <p>Nenhuma cidade cadastrada ainda.</p>
          <div className="flex justify-center">
            <NewCityForm onCreate={handleAddCity} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => (
            <div key={city.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <Link to={`/campanha/cidades/${city.id}`}>
                <div className="font-bold text-stone-900">{city.name}</div>
                {city.summary && <div className="text-sm text-stone-600 mt-1 line-clamp-2">{city.summary}</div>}
                <div className="text-xs text-stone-400 mt-2">
                  {city.npcs.length} NPC(s) · {city.rumors.length} rumor(es) · moral {city.morale.score}/100
                </div>
              </Link>
              {isGM && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (confirm(`Excluir "${city.name}"? Esta ação não pode ser desfeita.`)) removeCity(city.id);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
