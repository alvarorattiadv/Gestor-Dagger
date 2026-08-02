import type { Campaign } from './types';

export function downloadCampaignJson(campaign: Campaign) {
  const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${campaign.name.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'campanha'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseCampaignJson(text: string): Campaign {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !Array.isArray(data.cities) || !data.party) {
    throw new Error('Arquivo não parece ser um backup de campanha válido.');
  }
  return data as Campaign;
}
