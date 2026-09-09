// Password policy, strength scoring and a strong-password generator.
// Frontend-only helpers used by the auth screen.

/** Individual policy checks. Basic validity requires letters + numbers. */
export function passwordChecks(pw = '') {
  return {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
}

/** A password is acceptable for an account when it has 8+ chars, a letter and a number. */
export function isValidPassword(pw = '') {
  const c = passwordChecks(pw);
  return c.length && c.letter && c.number;
}

/**
 * Strength score 0-4 and a label. Strong = letters + numbers + special + length.
 * @returns {{ score:number, label:'Too short'|'Weak'|'Fair'|'Good'|'Strong', tone:'red'|'amber'|'green' }}
 */
export function passwordStrength(pw = '') {
  if (!pw) return { score: 0, label: 'Empty', tone: 'red' };
  const c = passwordChecks(pw);
  let score = 0;
  if (c.letter) score += 1;
  if (c.number) score += 1;
  if (c.special) score += 1;
  if (pw.length >= 12) score += 1;
  else if (pw.length >= 8) score += 0.5;

  if (!c.length) return { score: 1, label: 'Too short', tone: 'red' };
  if (score >= 3.5) return { score: 4, label: 'Strong', tone: 'green' };
  if (score >= 2.5) return { score: 3, label: 'Good', tone: 'green' };
  if (score >= 2) return { score: 2, label: 'Fair', tone: 'amber' };
  return { score: 1, label: 'Weak', tone: 'red' };
}

/** Generate a strong password with letters, numbers and special characters. */
export function generateStrongPassword(length = 14) {
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const special = '!@#$%^&*?-_';
  const all = lower + upper + digits + special;

  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  // Guarantee at least one of each required class.
  const chars = [pick(lower), pick(upper), pick(digits), pick(special)];
  for (let i = chars.length; i < length; i += 1) chars.push(pick(all));

  // Fisher-Yates shuffle so the required characters are not in fixed positions.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
