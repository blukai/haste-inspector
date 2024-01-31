const numberFormat = new Intl.NumberFormat();
export function formatNumber(value: number) {
  return numberFormat.format(value);
}
