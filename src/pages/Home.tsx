import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../store/characterStore';
import { useWizardStore } from '../store/wizardStore';
import { getClass } from '../data/classes';
import { getSpecies } from '../data/species';
import { Button } from '../components/Button';
import { downloadCharacterJson, parseCharacterJson } from '../export/json';

export function Home() {
  const characters = useCharacterStore((s) => s.characters);
  const removeCharacter = useCharacterStore((s) => s.removeCharacter);
  const duplicateCharacter = useCharacterStore((s) => s.duplicateCharacter);
  const importCharacter = useCharacterStore((s) => s.importCharacter);
  const resetDraft = useWizardStore((s) => s.resetDraft);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCreate() {
    resetDraft();
    navigate('/criar');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const character = parseCharacterJson(text);
      importCharacter(character);
      navigate(`/personagem/${character.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao importar o arquivo.');
    }
  }

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <header className="border-b border-stone-300 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-stone-900">Fichas de D&D 2024</h1>
          <div className="flex gap-2 flex-wrap">
            <Link
              to="/campanha"
              className="px-4 py-2 rounded-md font-medium text-sm bg-violet-700 text-white hover:bg-violet-800 transition-colors"
            >
              Gestão de Campanha (Daggerheart)
            </Link>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
            <Button variant="secondary" onClick={handleImportClick}>
              Importar JSON
            </Button>
            <Button onClick={handleCreate}>Novo Personagem</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {characters.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <p className="mb-4">Você ainda não tem nenhum personagem.</p>
            <Button onClick={handleCreate}>Criar meu primeiro personagem</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((c) => {
              const classDef = getClass(c.classId);
              const species = getSpecies(c.speciesId);
              return (
                <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <Link to={`/personagem/${c.id}`}>
                    <div className="font-bold text-stone-900 text-lg">{c.name}</div>
                    <div className="text-sm text-stone-600 mt-1">
                      {species?.name} {classDef?.name} · Nível {c.level}
                    </div>
                  </Link>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button onClick={() => downloadCharacterJson(c)} className="text-xs text-amber-800 hover:underline">
                      Exportar
                    </button>
                    <button onClick={() => duplicateCharacter(c.id)} className="text-xs text-stone-600 hover:underline">
                      Duplicar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir "${c.name}"? Esta ação não pode ser desfeita.`)) removeCharacter(c.id);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
