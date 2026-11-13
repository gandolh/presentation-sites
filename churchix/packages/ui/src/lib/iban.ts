/**
 * Does this string pass the IBAN checksum (ISO 13616, mod 97)? A parish that has not set a real account yet
 * carries a placeholder (`RO00 XXXX …`), which fails. Used for display only: the Home giving card hides the
 * account lines while the IBAN fails it. The content schema accepts any string and is not touched.
 */
export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const moved = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of moved) {
    const digits = ch >= "A" ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}
