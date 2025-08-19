// src/utils/format.js

// Devuelve la locale a usar según 'en' / 'es'
export const localeFromLang = (lang) => (String(lang).startsWith('es') ? 'es-CL' : 'en-US');

/**
 * Intenta convertir distintos formatos a Date:
 * - Date(YYYY,MM,DD)   (estilo Google Sheets)
 * - DD/MM/YYYY o DD-MM-YYYY
 * - YYYY-MM-DD o YYYY/MM/DD
 * - Cualquier string válido para new Date()
 */
export function toDate(input) {
  if (input === null || input === undefined || input === '') return null;
  if (input instanceof Date) return isNaN(input) ? null : input;

  const s = String(input).trim();

  // Date(2024,10,26)
  const mSheets = s.match(/Date\s*\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})/i);
  if (mSheets) {
    const y = Number(mSheets[1]);
    const mo = Number(mSheets[2]) - 1;
    const d = Number(mSheets[3]);
    const dt = new Date(y, mo, d);
    return isNaN(dt) ? null : dt;
  }

  // DD/MM/YYYY o DD-MM-YYYY
  let m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1;
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    const dt = new Date(y, mo, d);
    return isNaN(dt) ? null : dt;
  }

  // YYYY-MM-DD o YYYY/MM/DD
  m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    return isNaN(dt) ? null : dt;
  }

  // Fallback
  const dt = new Date(s);
  return isNaN(dt) ? null : dt;
}

// Formatea fechas con fallback a "-"
export function fmtDate(value, lang = 'en', opts) {
  const dt = toDate(value);
  if (!dt) return '-';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', ...opts };
  return new Intl.DateTimeFormat(localeFromLang(lang), options).format(dt);
}

// Enteros (separadores de miles)
export function fmtInt(n, lang = 'en') {
  const num = Number(n);
  if (!isFinite(num)) return '0';
  return new Intl.NumberFormat(localeFromLang(lang), { maximumFractionDigits: 0 }).format(num);
}

// Decimales genéricos
export function fmtDecimal(n, lang = 'en', maximumFractionDigits = 2) {
  const num = Number(n);
  if (!isFinite(num)) return '0';
  return new Intl.NumberFormat(localeFromLang(lang), { maximumFractionDigits }).format(num);
}

// Moneda
export function fmtCurrency(n, currency = 'USD', lang = 'en', opts) {
  const amount = Number(n);
  const options = { style: 'currency', currency, ...opts };
  if (!isFinite(amount)) {
    return new Intl.NumberFormat(localeFromLang(lang), options).format(0);
  }
  return new Intl.NumberFormat(localeFromLang(lang), options).format(amount);
}

// Porcentaje (recibe 0-100)
export function fmtPercent(v, lang = 'en', maximumFractionDigits = 0) {
  const num = Number(v);
  if (!isFinite(num)) return '0%';
  return new Intl.NumberFormat(localeFromLang(lang), {
    style: 'percent',
    maximumFractionDigits,
  }).format(num / 100);
}

