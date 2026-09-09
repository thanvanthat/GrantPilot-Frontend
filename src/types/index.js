// ---------------------------------------------------------------------------
// GrantPilot shared type layer.
//
// This project is plain JavaScript (no TypeScript toolchain), so the "types"
// requested for Phase 3 are expressed as JSDoc @typedefs. Editors surface
// these for autocomplete and hover docs, and they pin down the exact JSON
// shapes the SNS Workbench workflows are expected to return in a later phase.
//
// Import for annotations elsewhere:  /** @type {import('@/types').Opportunity} */
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CompanyProfile
 * @property {string} companyName
 * @property {string} sector
 * @property {string} [subSector]
 * @property {string} [description]
 * @property {string[]} technologies
 * @property {string} [capabilities]
 * @property {string} [products]
 * @property {string[]} certifications
 * @property {string} [previousGovProjects]
 * @property {number} experienceYears
 * @property {number} teamSize
 * @property {string} [revenue]
 * @property {string} [location]
 * @property {string} [stage]
 * @property {string} [website]
 * @property {string} [contactEmail]
 */

/**
 * @typedef {'Uploaded'|'Processing'|'Processed'|'Review Required'} DocumentStatus
 *
 * @typedef {Object} AppDocument
 * @property {string} id
 * @property {string} name
 * @property {number} size
 * @property {string} type            Compliance category, e.g. "Company Registration"
 * @property {DocumentStatus} status
 * @property {string} uploadedAt      ISO timestamp
 */

/**
 * @typedef {Object} EligibilityItem
 * @property {string} requirement
 * @property {'pass'|'partial'|'fail'} status
 *
 * @typedef {Object} MatchDetail
 * @property {string} requirement
 * @property {string} evidence
 * @property {'Matched'|'Partial'|'Gap'} status
 *
 * @typedef {Object} Opportunity
 * @property {string} id
 * @property {string} title
 * @property {string} organization
 * @property {string} sector
 * @property {string} type
 * @property {string} budget
 * @property {number} deadline        Days remaining
 * @property {number} matchScore
 * @property {string} description
 * @property {string[]} technicalRequirements
 * @property {EligibilityItem[]} eligibility
 * @property {string[]} documentsRequired
 * @property {MatchDetail[]} matchDetails
 */

/**
 * @typedef {'New'|'Reviewing'|'Pursuing'|'Skipped'} OpportunityStatus
 */

/**
 * @typedef {'PURSUE'|'REVIEW'|'SKIP'} Recommendation
 * @typedef {'HIGH'|'MEDIUM'|'LOW'} Confidence
 * @typedef {'Strong'|'Moderate'|'Weak'|'Low'} MatchClass
 * @typedef {'PASS'|'FAIL'|'PARTIAL'|'UNKNOWN'} EligibilityStatus
 *
 * @typedef {Object} SubScore
 * @property {number} score               0-100
 * @property {MatchClass} status
 * @property {string} explanation
 *
 * @typedef {Object} ScoreBreakdown
 * @property {SubScore} technical
 * @property {SubScore} sector
 * @property {SubScore} capability
 * @property {SubScore} experience
 * @property {SubScore} eligibility
 *
 * @typedef {Object} EligibilityResultItem
 * @property {string} requirement
 * @property {EligibilityStatus} status
 * @property {string} explanation
 * @property {string} evidence
 *
 * @typedef {Object} CapabilityMatch
 * @property {string[]} required
 * @property {string[]} matched
 * @property {string[]} partial
 * @property {string[]} missing
 *
 * @typedef {Object} RequirementItem
 * @property {string} category
 * @property {string} requirement
 * @property {'Matched'|'Partial'|'Missing'|'Review'} status
 * @property {string} evidence
 * @property {string} remarks
 *
 * @typedef {Object} GapItem
 * @property {string} category
 * @property {string} description
 * @property {'High'|'Medium'|'Low'} severity
 * @property {string} suggestedAction
 *
 * @typedef {Object} RiskItem
 * @property {string} title
 * @property {'High'|'Medium'|'Low'} severity
 * @property {string} explanation
 * @property {string} recommendedAction
 *
 * @typedef {Object} EvidenceItem
 * @property {'positive'|'caution'} polarity
 * @property {string} text
 *
 * @typedef {Object} QualificationResult
 * @property {string} opportunityId
 * @property {number} overallScore                 0-100
 * @property {MatchClass} matchClass
 * @property {ScoreBreakdown} scoreBreakdown
 * @property {EligibilityStatus} eligibilityStatus
 * @property {EligibilityResultItem[]} eligibilityItems
 * @property {CapabilityMatch} capabilityMatch
 * @property {RequirementItem[]} requirements
 * @property {GapItem[]} gaps
 * @property {RiskItem[]} risks
 * @property {EvidenceItem[]} evidence
 * @property {Recommendation} recommendation
 * @property {Confidence} confidence
 * @property {string} reason
 * @property {string[]} nextActions
 * @property {string} analyzedAt
 * @property {'mock'|'sns-workbench'} source
 */

/**
 * @typedef {'Draft'|'In Review'|'Ready'} ProposalStatus
 *
 * @typedef {Object} ProposalSectionState
 * @property {string} content
 * @property {boolean} complete
 *
 * @typedef {Object} Proposal
 * @property {string} opportunityId
 * @property {string} opportunityTitle
 * @property {string} organization
 * @property {ProposalStatus} status
 * @property {Record<string, ProposalSectionState>} sections
 * @property {string} createdAt
 */

/**
 * @typedef {'ADDRESSED'|'PARTIAL'|'MISSING'|'NEEDS_REVIEW'} ComplianceItemStatus
 * @typedef {'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'} Priority
 * @typedef {'PENDING'|'REVIEWED'|'NEEDS_CLARIFICATION'} ReviewerState
 * @typedef {'READY'|'MINOR_REVIEW'|'NEEDS_ATTENTION'|'NOT_READY'} ReadinessStatus
 *
 * @typedef {Object} ComplianceItem
 * @property {string} id
 * @property {string} requirementId
 * @property {string} requirement
 * @property {string} category
 * @property {Priority} priority
 * @property {ComplianceItemStatus} status
 * @property {string} [evidence]
 * @property {string} [evidenceSource]
 * @property {string} [qualificationFinding]
 * @property {string} [remarks]
 * @property {ReviewerState} reviewerState
 * @property {string} [reviewerNote]
 *
 * @typedef {Object} DocumentVerificationItem
 * @property {string} id
 * @property {string} required
 * @property {'AVAILABLE'|'MISSING'|'PARTIAL'|'NEEDS_REVIEW'} status
 * @property {string|null} matchedDocument
 *
 * @typedef {Object} ComplianceRisk
 * @property {string} id
 * @property {string} risk
 * @property {'High'|'Medium'|'Low'} severity
 * @property {string} relatedRequirement
 * @property {string} impact
 * @property {string} mitigation
 * @property {'Open'|'In Progress'|'Resolved'|'Accepted'} status
 *
 * @typedef {Object} ComplianceBlocker
 * @property {'High'|'Medium'|'Low'} severity
 * @property {string} requirement
 * @property {string} state
 * @property {string} action
 *
 * @typedef {Object} ComplianceResult
 * @property {string} opportunityId
 * @property {string} opportunityTitle
 * @property {string} organization
 * @property {ComplianceItem[]} items
 * @property {DocumentVerificationItem[]} documents
 * @property {ComplianceRisk[]} risks
 * @property {number} proposalReadiness
 * @property {number} readinessScore
 * @property {ReadinessStatus} readinessStatus
 * @property {{ready:boolean, checks:{id:string,label:string,pass:boolean}[]}} gate
 * @property {ComplianceBlocker[]} blockers
 * @property {Object} counts
 * @property {string} lastUpdated
 * @property {'mock'|'sns-workbench'} source
 */

// This module intentionally exports nothing at runtime; it exists for JSDoc.
export {};
