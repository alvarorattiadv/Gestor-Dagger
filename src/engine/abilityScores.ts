import type { AbilityKey } from '../types/rules';
import { ABILITY_KEYS } from '../types/rules';

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_BUDGET = 27;

export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function pointBuyCost(scores: Record<AbilityKey, number>): number {
  return ABILITY_KEYS.reduce((sum, key) => sum + (POINT_BUY_COST[scores[key]] ?? Infinity), 0);
}

export function isValidPointBuyScore(score: number): boolean {
  return score >= 8 && score <= 15;
}

export function isValidPointBuy(scores: Record<AbilityKey, number>): boolean {
  if (!ABILITY_KEYS.every((key) => isValidPointBuyScore(scores[key]))) return false;
  return pointBuyCost(scores) <= POINT_BUY_BUDGET;
}
