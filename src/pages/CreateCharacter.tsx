import { Link } from 'react-router-dom';
import { WizardLayout } from '../wizard/WizardLayout';

export function CreateCharacter() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <header className="border-b border-stone-300 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-amber-800 hover:underline">
            ← Voltar para personagens
          </Link>
          <h1 className="font-bold text-stone-900">Criar Personagem</h1>
        </div>
      </header>
      <WizardLayout />
    </div>
  );
}
