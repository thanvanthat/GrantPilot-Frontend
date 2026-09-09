// All 12 sectors GrantPilot supports. Badge classes are written as complete
// static strings so Tailwind's scanner picks them up.
export const SECTORS = [
  { id: 'defence', name: 'Defence', badge: 'bg-navy-100 text-navy-900 border-navy-900/20' },
  { id: 'mobility', name: 'Mobility/EV', badge: 'bg-teal-100 text-teal-800 border-teal-800/20' },
  { id: 'cybersecurity', name: 'Cybersecurity', badge: 'bg-purple-100 text-purple-800 border-purple-800/20' },
  { id: 'healthcare', name: 'Healthcare/MedTech', badge: 'bg-pink-100 text-pink-800 border-pink-800/20' },
  { id: 'spacetech', name: 'SpaceTech', badge: 'bg-indigo-100 text-indigo-800 border-indigo-800/20' },
  { id: 'agritech', name: 'AgriTech', badge: 'bg-green-100 text-green-800 border-green-800/20' },
  { id: 'cleantech', name: 'CleanTech/Energy', badge: 'bg-emerald-100 text-emerald-800 border-emerald-800/20' },
  { id: 'biotech', name: 'Biotech', badge: 'bg-orange-100 text-orange-800 border-orange-800/20' },
  { id: 'robotics', name: 'Robotics', badge: 'bg-sky-100 text-sky-800 border-sky-800/20' },
  { id: 'watertech', name: 'WaterTech', badge: 'bg-cyan-100 text-cyan-800 border-cyan-800/20' },
  { id: 'constructiontech', name: 'ConstructionTech', badge: 'bg-amber-100 text-amber-800 border-amber-800/20' },
  { id: 'climatetech', name: 'ClimateTech', badge: 'bg-lime-100 text-lime-800 border-lime-800/20' },
];

export const SECTOR_NAMES = SECTORS.map((s) => s.name);

export function sectorByName(name) {
  return SECTORS.find((s) => s.name === name);
}

export function sectorBadge(name) {
  return sectorByName(name)?.badge ?? 'bg-slate-100 text-slate-700 border-slate-300';
}

export const TECHNOLOGY_SUGGESTIONS = [
  'AI', 'ML', 'Computer Vision', 'Drones', 'IoT', 'Blockchain',
  'Cybersecurity', 'Cloud', 'Robotics', 'Battery Tech', 'Satellite', 'NLP',
];

export const CERTIFICATION_SUGGESTIONS = [
  'ISO 9001', 'ISO 27001', 'DPIIT', 'BIS', 'CERT-In', 'NABL',
];

export const DOCUMENT_TYPES = [
  'Certificate',
  'Project Report',
  'RFP/Tender',
  'Financial Document',
  'Company Registration',
];

export const OPPORTUNITY_TYPES = ['Procurement', 'Grant', 'Innovation Challenge'];
