import { Zone } from '../types';

export interface RateCard {
  intraZone: number;
  interZone: number;
  perKg: number;
}

export interface RateCardsConfig {
  B2C: RateCard;
  B2B: RateCard;
}

const DEFAULT_RATE_CARDS: RateCardsConfig = {
  B2C: { intraZone: 50, interZone: 100, perKg: 10 },
  B2B: { intraZone: 40, interZone: 80, perKg: 8 },
};

export function calculateRate(
  pickupZone: Zone,
  dropZone: Zone,
  l: number, b: number, h: number,
  actualWeight: number,
  orderType: 'B2B' | 'B2C',
  paymentType: 'Prepaid' | 'COD',
  // Optional configuration values to support zero hardcoding
  customRateCards?: RateCardsConfig,
  customCodSurcharge?: number,
  customVolumetricDivisor?: number
) {
  const isIntraZone = pickupZone === dropZone;
  
  const divisor = customVolumetricDivisor ?? 5000;
  const volumetricWeight = (l * b * h) / divisor;
  const billableWeight = Math.max(actualWeight, volumetricWeight);
  
  const rateCards = customRateCards ?? DEFAULT_RATE_CARDS;
  const rateCard = rateCards[orderType];
  const codSurcharge = customCodSurcharge ?? 20;

  let baseCharge = isIntraZone ? rateCard.intraZone : rateCard.interZone;
  
  if (billableWeight > 1) {
    baseCharge += Math.ceil(billableWeight - 1) * rateCard.perKg;
  }
  
  if (paymentType === 'COD') {
    baseCharge += codSurcharge;
  }
  
  return {
    volumetricWeight,
    billableWeight,
    totalCharge: Math.round(baseCharge * 100) / 100
  };
}
