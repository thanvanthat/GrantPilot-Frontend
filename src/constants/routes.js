// Centralised route strings + helpers so routes are not hardcoded everywhere.
export const ROUTES = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  opportunities: '/opportunities',
  pipeline: '/pipeline',
  compare: '/compare',
  proposals: '/proposals',
  compliance: '/compliance',
  reports: '/reports',
  profile: '/profile',
  account: '/account',
  documents: '/documents',
  settings: '/settings',
};

export const opportunityRoute = (id) => `/opportunities/${id}`;
export const proposalRoute = (id) => `/proposals/${id}`;
export const complianceRoute = (opportunityId) => `/compliance?opportunity=${opportunityId}`;

/** Only permit in-app (same-origin path) redirects; never external URLs. */
export function safeRedirect(path, fallback = ROUTES.dashboard) {
  if (typeof path !== 'string') return fallback;
  // Must start with a single slash and not be protocol-relative ("//host").
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}
