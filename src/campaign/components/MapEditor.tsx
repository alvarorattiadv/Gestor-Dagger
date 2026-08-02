import { useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { City, MapBackground, MapData, MapIconId, MapMarker } from '../types';
import { ICON_LABELS, ICON_LIST, MapIcon } from '../icons';
import { loadImageFile } from '../utils/loadImageFile';
import { useRoleStore } from '../role';
import { Button } from '../../components/Button';
import { SmallButton } from './SmallButton';

const BACKGROUNDS: Record<MapBackground, string> = {
  parchment: 'radial-gradient(ellipse at 30% 20%, #f1e4c3 0%, #e4d2a3 55%, #d3ba7c 100%)',
  grid:
    'linear-gradient(#00000012 1px, transparent 1px), linear-gradient(90deg, #00000012 1px, transparent 1px), #f4efe6',
  plain: '#eee7da',
  dark: 'radial-gradient(ellipse at 30% 20%, #3a3448 0%, #241f30 60%, #16121e 100%)',
};

const BACKGROUND_LABELS: Record<MapBackground, string> = {
  parchment: 'Pergaminho',
  grid: 'Grade',
  plain: 'Liso',
  dark: 'Noturno',
};

const COLORS = ['#5a4a30', '#b8860b', '#7c3aed', '#0f766e', '#b91c1c', '#1d4ed8', '#374151'];

type Placing = { kind: 'icon'; icon: MapIconId } | { kind: 'text' } | null;

interface MapEditorProps {
  map: MapData;
  onChange: (map: MapData) => void;
  allowCityLink?: boolean;
  cities?: City[];
  onNavigateCity?: (cityId: string) => void;
  heightClassName?: string;
  /** When set, this image is always the canvas background and the background picker is hidden. */
  fixedBackgroundImage?: string;
  /** CSS aspect-ratio (e.g. "1600/2074") to keep marker positions aligned to fixedBackgroundImage with no cropping. */
  fixedImageAspectRatio?: string;
}

export function MapEditor({
  map,
  onChange,
  allowCityLink,
  cities,
  onNavigateCity,
  heightClassName,
  fixedBackgroundImage,
  fixedImageAspectRatio,
}: MapEditorProps) {
  const [editMode, setEditMode] = useState(false);
  const [placing, setPlacing] = useState<Placing>(null);
  const [placingColor, setPlacingColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isGM = useRoleStore((s) => s.role === 'gm');
  const dragState = useRef<{ id: string; moved: boolean } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingMarker = map.markers.find((m) => m.id === editingId) ?? null;
  const viewingMarker = map.markers.find((m) => m.id === viewingId) ?? null;

  const effectiveImage = fixedBackgroundImage ?? map.customImage;
  const effectiveAspectRatio = fixedBackgroundImage ? fixedImageAspectRatio : map.customImageAspectRatio;

  function updateMarkers(next: MapMarker[]) {
    onChange({ ...map, markers: next });
  }

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { dataUrl, width, height } = await loadImageFile(file);
      onChange({ ...map, customImage: dataUrl, customImageAspectRatio: `${width}/${height}` });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveCustomImage() {
    onChange({ ...map, customImage: undefined, customImageAspectRatio: undefined });
  }

  function handleCanvasClick(e: ReactPointerEvent<HTMLDivElement>) {
    if (!editMode || !placing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = crypto.randomUUID();
    const marker: MapMarker =
      placing.kind === 'text'
        ? { id, x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)), kind: 'text', color: placingColor, label: 'Novo texto', note: '' }
        : {
            id,
            x: Math.max(2, Math.min(98, x)),
            y: Math.max(2, Math.min(98, y)),
            kind: 'icon',
            icon: placing.icon,
            color: placingColor,
            label: 'Novo marcador',
            note: '',
          };
    updateMarkers([...map.markers, marker]);
    setPlacing(null);
    setEditingId(id);
  }

  function handleMarkerPointerDown(e: ReactPointerEvent<HTMLButtonElement>, marker: MapMarker) {
    if (!editMode) return;
    e.stopPropagation();
    dragState.current = { id: marker.id, moved: false };
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleMove(ev: PointerEvent) {
      if (!dragState.current || !canvas) return;
      dragState.current.moved = true;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(2, Math.min(98, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((ev.clientY - rect.top) / rect.height) * 100));
      updateMarkers(map.markers.map((m) => (m.id === marker.id ? { ...m, x, y } : m)));
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      if (dragState.current && !dragState.current.moved) {
        setEditingId(marker.id);
      }
      dragState.current = null;
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  function handleMarkerClick(marker: MapMarker) {
    if (editMode) return;
    if (marker.linkCityId && onNavigateCity) {
      onNavigateCity(marker.linkCityId);
      return;
    }
    setViewingId(marker.id === viewingId ? null : marker.id);
  }

  function deleteMarker(id: string) {
    updateMarkers(map.markers.filter((m) => m.id !== id));
    setEditingId(null);
  }

  const linkedCity = editingMarker?.linkCityId ? cities?.find((c) => c.id === editingMarker.linkCityId) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={editMode ? 'primary' : 'secondary'}
          onClick={() => {
            setEditMode((v) => !v);
            setPlacing(null);
            setViewingId(null);
          }}
        >
          {editMode ? 'Concluir edição' : 'Editar mapa'}
        </Button>
        {!fixedBackgroundImage && !map.customImage && (
          <select
            value={map.background}
            onChange={(e) => onChange({ ...map, background: e.target.value as MapBackground })}
            className="border border-stone-300 rounded-md text-sm px-2 py-2 bg-white"
          >
            {(Object.keys(BACKGROUND_LABELS) as MapBackground[]).map((bg) => (
              <option key={bg} value={bg}>
                Fundo: {BACKGROUND_LABELS[bg]}
              </option>
            ))}
          </select>
        )}
        {!fixedBackgroundImage && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
            <SmallButton variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Enviando...' : map.customImage ? 'Trocar imagem' : '📤 Upload de imagem'}
            </SmallButton>
            {map.customImage && (
              <SmallButton variant="secondary" onClick={handleRemoveCustomImage}>
                Remover imagem
              </SmallButton>
            )}
          </>
        )}
        {editMode && (
          <span className="text-xs text-stone-500">
            {placing ? 'Clique no mapa para posicionar.' : 'Escolha um ícone ou "Texto" abaixo e clique no mapa, ou arraste/clique em um marcador existente.'}
          </span>
        )}
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

      {editMode && (
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg p-2">
          <button
            title="Adicionar texto (ex: nome de região)"
            onClick={() => setPlacing(placing?.kind === 'text' ? null : { kind: 'text' })}
            className={`h-9 px-3 flex items-center justify-center rounded-md border text-sm font-semibold italic transition-colors ${
              placing?.kind === 'text' ? 'bg-violet-700 border-violet-700 text-white' : 'bg-white border-stone-300 text-stone-700 hover:border-violet-400'
            }`}
          >
            Texto
          </button>
          <div className="w-px h-7 bg-stone-300 mx-0.5" />
          {ICON_LIST.map((iconId) => (
            <button
              key={iconId}
              title={ICON_LABELS[iconId]}
              onClick={() => setPlacing(placing?.kind === 'icon' && placing.icon === iconId ? null : { kind: 'icon', icon: iconId })}
              className={`w-9 h-9 flex items-center justify-center rounded-md border transition-colors ${
                placing?.kind === 'icon' && placing.icon === iconId
                  ? 'bg-violet-700 border-violet-700 text-white'
                  : 'bg-white border-stone-300 text-stone-700 hover:border-violet-400'
              }`}
            >
              <MapIcon icon={iconId} className="w-5 h-5" />
            </button>
          ))}
          <div className="w-px h-7 bg-stone-300 mx-1" />
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setPlacingColor(color)}
              className={`w-6 h-6 rounded-full border-2 ${placingColor === color ? 'border-stone-900' : 'border-white'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`relative w-full ${effectiveAspectRatio ? '' : (heightClassName ?? 'h-[420px]')} rounded-xl border border-stone-300 overflow-hidden ${
          editMode && placing ? 'cursor-crosshair' : ''
        }`}
        style={
          effectiveImage
            ? { aspectRatio: effectiveAspectRatio }
            : { background: BACKGROUNDS[map.background], backgroundSize: map.background === 'grid' ? '28px 28px, 28px 28px, auto' : undefined }
        }
      >
        {effectiveImage && (
          <img src={effectiveImage} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" draggable={false} />
        )}

        {map.markers.map((marker) => {
          const isDark = map.background === 'dark' && !effectiveImage;
          const isText = marker.kind === 'text';
          return (
            <button
              key={marker.id}
              onPointerDown={(e) => handleMarkerPointerDown(e, marker)}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(marker);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              {isText ? (
                <span
                  className="whitespace-nowrap px-1 font-semibold italic transition-transform group-hover:scale-105"
                  style={{ color: marker.color, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '20px', letterSpacing: '0.04em' }}
                >
                  {marker.label}
                </span>
              ) : (
                <>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/80 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: marker.color }}
                  >
                    <MapIcon icon={marker.icon ?? 'poi'} className="w-4.5 h-4.5 text-white" />
                  </span>
                  <span
                    className={`mt-1 text-[11px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${
                      isDark ? 'bg-black/60 text-white' : 'bg-white/85 text-stone-800'
                    }`}
                  >
                    {marker.label}
                  </span>
                </>
              )}
            </button>
          );
        })}

        {map.markers.length === 0 && !effectiveImage && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-500 text-sm px-6 text-center">
            {editMode ? 'Escolha um ícone ou "Texto" acima e clique aqui para adicionar.' : 'Nenhum marcador ainda. Clique em "Editar mapa" para começar.'}
          </div>
        )}
      </div>

      {viewingMarker && !editMode && (
        <div className="bg-white border border-stone-200 rounded-lg p-3 text-sm">
          <div className="font-semibold text-stone-900">{viewingMarker.label}</div>
          {viewingMarker.note && <div className="text-stone-600 mt-1 whitespace-pre-wrap">{viewingMarker.note}</div>}
        </div>
      )}

      {editingMarker && (
        <div className="bg-white border border-violet-300 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-900">{editingMarker.kind === 'text' ? 'Editar texto' : 'Editar marcador'}</span>
            <button onClick={() => setEditingId(null)} className="text-xs text-stone-500 hover:underline">
              Fechar
            </button>
          </div>
          <input
            value={editingMarker.label}
            onChange={(e) => updateMarkers(map.markers.map((m) => (m.id === editingMarker.id ? { ...m, label: e.target.value } : m)))}
            placeholder={editingMarker.kind === 'text' ? 'Texto (ex: nome da região)' : 'Nome'}
            className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
          />
          {editingMarker.kind !== 'text' && (
            <textarea
              value={editingMarker.note}
              onChange={(e) => updateMarkers(map.markers.map((m) => (m.id === editingMarker.id ? { ...m, note: e.target.value } : m)))}
              placeholder="Nota (visível ao clicar no marcador)"
              className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
              rows={2}
            />
          )}
          {editingMarker.kind !== 'text' && (
            <div className="flex flex-wrap gap-1.5">
              {ICON_LIST.map((iconId) => (
                <button
                  key={iconId}
                  title={ICON_LABELS[iconId]}
                  onClick={() => updateMarkers(map.markers.map((m) => (m.id === editingMarker.id ? { ...m, icon: iconId } : m)))}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                    editingMarker.icon === iconId ? 'bg-violet-700 border-violet-700 text-white' : 'bg-white border-stone-300 text-stone-700'
                  }`}
                >
                  <MapIcon icon={iconId} className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-1.5">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateMarkers(map.markers.map((m) => (m.id === editingMarker.id ? { ...m, color } : m)))}
                className={`w-6 h-6 rounded-full border-2 ${editingMarker.color === color ? 'border-stone-900' : 'border-white'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {allowCityLink && linkedCity && (
            <div className="text-xs text-stone-600 bg-stone-50 rounded-md px-2 py-1.5">
              🔗 Vinculado à cidade "{linkedCity.name}" — para remover este marcador, exclua a cidade na aba Cidades.
            </div>
          )}
          {!linkedCity && isGM && (
            <div className="flex justify-end">
              <SmallButton variant="danger" onClick={() => deleteMarker(editingMarker.id)}>
                Excluir
              </SmallButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
