// Language-agnostic translation engine.
// - one lookup path for every language
// - English fallback for any missing key
// - {var} interpolation
// - dev-only warning for missing keys (never shows raw keys to users)

import { DEFAULT_LANGUAGE } from '@/i18n/config';
import en from '@/i18n/translations/en';
import ta from '@/i18n/translations/ta';
import hi from '@/i18n/translations/hi';
import te from '@/i18n/translations/te';
import kn from '@/i18n/translations/kn';
import ml from '@/i18n/translations/ml';

export const resources = { en, ta, hi, te, kn, ml };

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
const warned = new Set();

function lookup(bundle, key) {
  if (!bundle) return undefined;
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), bundle);
}

function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/** Translate a key for a locale, falling back to English, then a readable label. */
export function translate(language, key, vars) {
  const active = resources[language] || resources[DEFAULT_LANGUAGE];
  let value = lookup(active, key);
  if (value === undefined) value = lookup(resources[DEFAULT_LANGUAGE], key); // fallback to English
  if (value === undefined) {
    if (isDev && !warned.has(key)) { warned.add(key); console.warn(`[i18n] missing translation key: "${key}"`); }
    // Never surface a raw dotted key to the user — humanise the last segment.
    const last = key.split('.').pop() || key;
    return last.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }
  return interpolate(value, vars);
}

/** Dev helper: report keys present in English but missing in another language. */
export function findMissingKeys(language) {
  const flat = (obj, prefix = '') => Object.entries(obj || {}).flatMap(([k, v]) =>
    (v && typeof v === 'object') ? flat(v, `${prefix}${k}.`) : [`${prefix}${k}`]);
  const enKeys = new Set(flat(resources.en));
  const langKeys = new Set(flat(resources[language]));
  return [...enKeys].filter((k) => !langKeys.has(k));
}
