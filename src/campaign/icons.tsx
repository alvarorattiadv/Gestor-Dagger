import type { MapIconId } from './types';

type IconProps = { className?: string };

export const ICON_LABELS: Record<MapIconId, string> = {
  city: 'Cidade',
  village: 'Vilarejo',
  castle: 'Castelo/Fortaleza',
  mountain: 'Montanha',
  forest: 'Floresta',
  water: 'Água/Lago',
  ruins: 'Ruínas',
  cave: 'Caverna/Masmorra',
  port: 'Porto',
  temple: 'Templo/Santuário',
  camp: 'Acampamento',
  danger: 'Perigo',
  poi: 'Ponto de interesse',
  templarCross: 'Marca Templária',
};

export const ICON_LIST: MapIconId[] = [
  'city',
  'village',
  'castle',
  'mountain',
  'forest',
  'water',
  'ruins',
  'cave',
  'port',
  'temple',
  'camp',
  'danger',
  'poi',
  'templarCross',
];

function City({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="2" y="11" width="5" height="11" />
      <rect x="9" y="6" width="6" height="16" />
      <rect x="17" y="13" width="5" height="9" />
      <rect x="10.5" y="9" width="1.4" height="1.4" fill="white" />
      <rect x="13" y="9" width="1.4" height="1.4" fill="white" />
      <rect x="10.5" y="12" width="1.4" height="1.4" fill="white" />
      <rect x="13" y="12" width="1.4" height="1.4" fill="white" />
      <rect x="3.2" y="14" width="1.2" height="1.2" fill="white" />
      <rect x="18.2" y="15" width="1.2" height="1.2" fill="white" />
    </svg>
  );
}

function Village({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M5 21v-7l-2 1.2V13l6-4 6 4v2.2l-2-1.2v7z" />
      <path d="M14 21v-5.2l-1.4-.9 5.4-3.4 5.4 3.4L22 15.8V21z" opacity="0.7" />
    </svg>
  );
}

function Castle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 4h2v2h2V4h2v2h2V4h2v2h2V4h2v2h2v3l-1.5 1.5V22H4.5v-11.5L3 9z" />
      <rect x="10" y="13" width="4" height="9" fill="white" opacity="0.85" />
    </svg>
  );
}

function Mountain({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z" />
      <path d="M9 8 L11.5 12 L9.5 12.5 L7.7 11.2 Z" fill="white" opacity="0.85" />
      <path d="M16 10 L17.6 12.3 L15.6 12.7 L14.4 11.5 Z" fill="white" opacity="0.85" />
    </svg>
  );
}

function Forest({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M6 3 L10 10 H8 L11 15 H2 L5 10 H3 Z" />
      <path d="M15 6 L19.5 14 H17 L20.5 19 H9.5 L13 14 H10.5 Z" />
      <rect x="5.2" y="15" width="1.6" height="4" />
      <rect x="14" y="19" width="2" height="3" />
    </svg>
  );
}

function Water({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 14.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </svg>
  );
}

function Ruins({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="2" y="9" width="3" height="13" />
      <rect x="10.3" y="4" width="3" height="18" />
      <rect x="18" y="12" width="3" height="10" />
      <rect x="4.2" y="16" width="5.5" height="2.6" transform="rotate(-16 4.2 16)" opacity="0.85" />
    </svg>
  );
}

function Cave({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M1 22C1 12 6 5 12 5s11 7 11 17z" />
      <path d="M6 22c0-6.5 2.8-11.5 6-11.5s6 5 6 11.5z" fill="white" opacity="0.9" />
      <path d="M4 9 L3 6 M8 5 L7.3 2 M16 5 L16.7 2 M20 9 L21 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Port({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1.8" fill="currentColor" stroke="none" />
      <path d="M12 7v13" />
      <path d="M8 9h8" />
      <path d="M4 14c0 4 3.5 7 8 7s8-3 8-7" />
    </svg>
  );
}

function Temple({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 L22 8 H2 Z" />
      <rect x="3" y="9" width="2" height="10" />
      <rect x="7.3" y="9" width="2" height="10" />
      <rect x="11.6" y="9" width="2" height="10" />
      <rect x="15.9" y="9" width="2" height="10" />
      <rect x="19.2" y="9" width="2" height="10" />
      <rect x="2" y="19.5" width="20" height="2" />
    </svg>
  );
}

function Camp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 3 L21 21 H15.5 L12 13 L8.5 21 H3 Z" />
      <rect x="11.2" y="14" width="1.6" height="7" fill="white" opacity="0.9" />
    </svg>
  );
}

function Danger({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 L23 21 H1 Z" />
      <rect x="11" y="9" width="2" height="6" fill="white" />
      <rect x="11" y="16.5" width="2" height="2" fill="white" />
    </svg>
  );
}

function Poi({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.6" fill="white" />
    </svg>
  );
}

function TemplarCross({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9.5 2 L14.5 2 L13.4 9.5 L21 8.3 L21 15 L13.4 13.9 L14.5 22 L9.5 22 L10.6 13.9 L3 15 L3 8.3 L10.6 9.5 Z" />
    </svg>
  );
}

export const ICONS: Record<MapIconId, (p: IconProps) => React.ReactElement> = {
  city: City,
  village: Village,
  castle: Castle,
  mountain: Mountain,
  forest: Forest,
  water: Water,
  ruins: Ruins,
  cave: Cave,
  port: Port,
  temple: Temple,
  camp: Camp,
  danger: Danger,
  poi: Poi,
  templarCross: TemplarCross,
};

export function MapIcon({ icon, className }: { icon: MapIconId; className?: string }) {
  const Cmp = ICONS[icon];
  return <Cmp className={className} />;
}
