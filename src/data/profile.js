// Seed company profile. Every AI matching call sends this object to the
// SNS Workbench backend alongside the extracted document text.
export const DEFAULT_PROFILE = {
  companyName: 'Aeroview Systems',
  sector: 'Defence',
  subSector: 'Autonomous aerial surveillance',
  technologies: ['AI', 'Computer Vision', 'Drones', 'IoT'],
  capabilities:
    'Edge AI inference on constrained hardware, autonomous flight control, real-time video analytics, encrypted telemetry links and air-gapped on-premise deployment.',
  products:
    'Netra — an autonomous perimeter surveillance drone with an edge computer vision stack.\nNetra Ground — a fleet monitoring and alerting console for security operations teams.',
  experienceYears: 4,
  teamSize: 22,
  revenue: '₹50L',
  certifications: ['ISO 9001', 'ISO 27001', 'DPIIT'],
  location: 'Bengaluru, Karnataka',
  previousGovProjects:
    'Perimeter surveillance pilot with Karnataka State Police (2024). Municipal citizen safety dashboard for Bengaluru Smart City Ltd (2023).',
  stage: 'Early Growth',
};

// Empty profile used for a freshly registered account — the new user fills
// this in on the Profile page before matching, qualification or proposals.
export const BLANK_PROFILE = {
  companyName: '',
  sector: '',
  subSector: '',
  technologies: [],
  capabilities: '',
  products: '',
  experienceYears: '',
  teamSize: '',
  revenue: '',
  certifications: [],
  location: '',
  previousGovProjects: '',
  stage: '',
};

/** True when the core profile fields a new user must supply are filled in. */
export function isProfileComplete(profile) {
  return Boolean(profile?.companyName?.trim() && profile?.sector && (profile?.technologies || []).length);
}
