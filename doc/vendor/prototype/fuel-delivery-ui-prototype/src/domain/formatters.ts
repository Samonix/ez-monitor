const numberFormatter = new Intl.NumberFormat('uk-UA');

export function formatLiters(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'очікується';
  }

  return `${numberFormatter.format(value)} л`;
}

export function signedLiters(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'очікується';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${formatLiters(value)}`;
}
