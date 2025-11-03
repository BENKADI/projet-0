/**
 * Formate un montant selon la devise configurée
 */
export const formatCurrency = (amount: number, currency?: string): string => {
  const appCurrency = currency || localStorage.getItem('appCurrency') || 'DZD';
  
  const currencySymbols: Record<string, string> = {
    DZD: 'د.ج',
    EUR: '€',
    USD: '$',
    GBP: '£',
    MAD: 'د.م.',
    TND: 'د.ت'
  };

  const symbol = currencySymbols[appCurrency] || appCurrency;
  
  // Format selon la locale
  const formatted = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  // Placer le symbole selon la devise
  if (appCurrency === 'DZD' || appCurrency === 'MAD' || appCurrency === 'TND') {
    return `${formatted} ${symbol}`;
  } else {
    return `${symbol}${formatted}`;
  }
};

/**
 * Récupère la devise actuelle de l'application
 */
export const getCurrentCurrency = (): string => {
  return localStorage.getItem('appCurrency') || 'DZD';
};

/**
 * Récupère le symbole de la devise actuelle
 */
export const getCurrencySymbol = (currency?: string): string => {
  const appCurrency = currency || getCurrentCurrency();
  
  const currencySymbols: Record<string, string> = {
    DZD: 'د.ج',
    EUR: '€',
    USD: '$',
    GBP: '£',
    MAD: 'د.م.',
    TND: 'د.ت'
  };

  return currencySymbols[appCurrency] || appCurrency;
};
