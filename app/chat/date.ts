export function formatDateOnly(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
