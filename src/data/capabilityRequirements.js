// Per-opportunity capability and certification requirements. Kept separate
// from the opportunity corpus so the qualification engine can compare them
// against the live company profile without editing every opportunity object.
// Capabilities use the same vocabulary as the profile's technology tags.
export const CAPABILITY_REQUIREMENTS = {
  'opp-001': { requiredCapabilities: ['Computer Vision', 'Drones', 'Edge AI', 'Real-time Processing'], requiredCertifications: ['ISO 27001'] },
  'opp-002': { requiredCapabilities: ['Computer Vision', 'IoT', 'Edge AI', 'Sensor Fusion'], requiredCertifications: ['ISO 27001'] },
  'opp-003': { requiredCapabilities: ['ML', 'IoT', 'Cloud', 'Battery Tech'], requiredCertifications: ['DPIIT'] },
  'opp-004': { requiredCapabilities: ['Cloud', 'IoT', 'ML'], requiredCertifications: ['ISO 9001'] },
  'opp-005': { requiredCapabilities: ['AI', 'ML', 'Cybersecurity', 'Cloud'], requiredCertifications: ['ISO 27001', 'CERT-In'] },
  'opp-006': { requiredCapabilities: ['Cybersecurity', 'Cloud'], requiredCertifications: ['CERT-In'] },
  'opp-007': { requiredCapabilities: ['Computer Vision', 'ML', 'NLP'], requiredCertifications: ['ISO 27001'] },
  'opp-008': { requiredCapabilities: ['Computer Vision', 'Satellite', 'Cloud'], requiredCertifications: [] },
  'opp-009': { requiredCapabilities: ['Computer Vision', 'Drones', 'IoT', 'NLP'], requiredCertifications: ['DPIIT'] },
  'opp-010': { requiredCapabilities: ['AI', 'IoT', 'Cloud'], requiredCertifications: ['ISO 9001'] },
};

export function requirementsFor(opportunityId) {
  return CAPABILITY_REQUIREMENTS[opportunityId] || { requiredCapabilities: [], requiredCertifications: [] };
}
