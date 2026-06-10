export const CURRENCIES = ['SAR', 'AED', 'EGP', 'IQD', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'USD'] as const
export type Currency = (typeof CURRENCIES)[number]

export const CURRENCY_LABELS: Record<Currency, { en: string; ar: string }> = {
  SAR: { en: 'Saudi Riyal', ar: 'ريال سعودي' },
  AED: { en: 'UAE Dirham', ar: 'درهم إماراتي' },
  EGP: { en: 'Egyptian Pound', ar: 'جنيه مصري' },
  IQD: { en: 'Iraqi Dinar', ar: 'دينار عراقي' },
  KWD: { en: 'Kuwaiti Dinar', ar: 'دينار كويتي' },
  QAR: { en: 'Qatari Riyal', ar: 'ريال قطري' },
  BHD: { en: 'Bahraini Dinar', ar: 'دينار بحريني' },
  OMR: { en: 'Omani Rial', ar: 'ريال عماني' },
  JOD: { en: 'Jordanian Dinar', ar: 'دينار أردني' },
  USD: { en: 'US Dollar', ar: 'دولار أمريكي' },
}
