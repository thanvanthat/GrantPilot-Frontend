import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_PROFILE, BLANK_PROFILE } from '@/data/profile';
import { OPPORTUNITIES, getOpportunity } from '@/data/opportunities';
import { SEED_DOCUMENTS } from '@/data/documents';
import { createProposalDraft } from '@/data/proposalSections';
import { buildComplianceResult } from '@/utils/complianceEngine';

// Single global application context (the "GrantPilotContext" of the spec).
// Every page reads and writes shared state here — there are no duplicate
// data copies across pages. State is in-memory only; no localStorage.
const AppContext = createContext(null);

/** @typedef {import('@/types').OpportunityStatus} OpportunityStatus */

// NOTE: authentication now lives in AuthContext. GrantPilotContext holds only
// application data (company, documents, opportunities, qualification,
// proposals, compliance, pipeline). The two are kept separate on purpose.

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [documents, setDocuments] = useState(SEED_DOCUMENTS);

  // Matching results start seeded so the dashboard has content; re-running the
  // matching engine on the Opportunities page replaces this list.
  const [matches, setMatches] = useState(OPPORTUNITIES);
  const [lastMatchRun, setLastMatchRun] = useState(null);

  // Per-opportunity workflow status: New | Reviewing | Pursuing | Skipped.
  const [opportunityStatuses, setOpportunityStatuses] = useState({});

  // Qualification (match) results, keyed by opportunity id (mock SNS output).
  const [qualifications, setQualifications] = useState({});

  // Proposal drafts, keyed by opportunity id.
  const [proposals, setProposals] = useState({});

  // Compliance results (computed snapshots) and reviewer overrides, keyed by
  // opportunity id. Reviews persist across re-runs; results are the snapshot.
  const [complianceResults, setComplianceResults] = useState({});
  const [complianceReviews, setComplianceReviews] = useState({});

  // The opportunity currently being worked on (drives /proposals and
  // /compliance when they are opened without an explicit id).
  const [activeOpportunityId, setActiveOpportunityId] = useState(null);

  // Lightweight in-app toast (no external library).
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => setToast({ id: Date.now(), message }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  // --- Workspace loaders ----------------------------------------------------
  // Replace the whole workspace (profile, documents and all derived state).
  // The auth flow calls these after sign-in/register; Settings uses resetDemo.
  const loadWorkspace = useCallback((profileObj, docs) => {
    setProfile(profileObj);
    setDocuments(docs);
    setMatches(OPPORTUNITIES);
    setLastMatchRun(null);
    setOpportunityStatuses({});
    setQualifications({});
    setProposals({});
    setComplianceResults({});
    setComplianceReviews({});
    setActiveOpportunityId(null);
  }, []);

  // Populated demo workspace (used by demo sign-in and Reset Demo Data).
  const loadDemoWorkspace = useCallback(() => loadWorkspace(DEFAULT_PROFILE, SEED_DOCUMENTS), [loadWorkspace]);
  // Empty workspace for a freshly registered account.
  const resetWorkspaceBlank = useCallback(() => loadWorkspace({ ...BLANK_PROFILE }, []), [loadWorkspace]);
  // Reset Demo Data (Settings) — never touches authentication.
  const resetDemo = useCallback(() => loadDemoWorkspace(), [loadDemoWorkspace]);

  // --- Company profile ------------------------------------------------------
  const updateCompanyProfile = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  // --- Documents ------------------------------------------------------------
  const addDocument = useCallback((doc) => {
    setDocuments((prev) => [...prev, doc]);
  }, []);

  const addDocuments = useCallback((docs) => {
    setDocuments((prev) => [...prev, ...docs]);
  }, []);

  const removeDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const setDocumentType = useCallback((id, type) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, type } : d)));
  }, []);

  const updateDocumentStatus = useCallback((id, status) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  // --- Opportunity selection & status --------------------------------------
  const selectOpportunity = useCallback((id) => setActiveOpportunityId(id), []);
  const clearSelectedOpportunity = useCallback(() => setActiveOpportunityId(null), []);

  const markOpportunityStatus = useCallback((id, status) => {
    setOpportunityStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const getOpportunityStatus = useCallback(
    (id) => opportunityStatuses[id] || 'New',
    [opportunityStatuses],
  );

  // --- Match / qualification results ---------------------------------------
  const saveMatchResult = useCallback((opportunityId, result) => {
    setQualifications((prev) => ({ ...prev, [opportunityId]: result }));
  }, []);

  // --- Proposals ------------------------------------------------------------
  // If the opportunity has been qualified, the draft is seeded from that
  // qualification result so it reflects the analysis.
  const ensureProposal = useCallback(
    (opportunityId) => {
      setActiveOpportunityId(opportunityId);
      setProposals((prev) => {
        if (prev[opportunityId]) return prev;
        const opportunity = getOpportunity(opportunityId);
        if (!opportunity) return prev;
        return { ...prev, [opportunityId]: createProposalDraft(opportunity, profile, qualifications[opportunityId]) };
      });
    },
    [profile, qualifications],
  );

  const updateProposalSection = useCallback((opportunityId, sectionId, patch) => {
    setProposals((prev) => {
      const draft = prev[opportunityId];
      if (!draft) return prev;
      return {
        ...prev,
        [opportunityId]: {
          ...draft,
          sections: { ...draft.sections, [sectionId]: { ...draft.sections[sectionId], ...patch } },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateProposalStatus = useCallback((opportunityId, status) => {
    setProposals((prev) => {
      const draft = prev[opportunityId];
      if (!draft) return prev;
      return { ...prev, [opportunityId]: { ...draft, status } };
    });
  }, []);

  // --- Compliance -----------------------------------------------------------
  // Compute (or recompute) a compliance snapshot for an opportunity from its
  // qualification, proposal, documents and any reviewer overrides.
  const computeCompliance = useCallback(
    (opportunityId, reviews) => {
      const opportunity = getOpportunity(opportunityId);
      const qualification = qualifications[opportunityId];
      if (!opportunity || !qualification) return null;
      return buildComplianceResult(opportunity, qualification, proposals[opportunityId], documents, reviews || complianceReviews[opportunityId] || {});
    },
    [qualifications, proposals, documents, complianceReviews],
  );

  const runComplianceCheck = useCallback(
    (opportunityId) => {
      const result = computeCompliance(opportunityId);
      if (result) setComplianceResults((prev) => ({ ...prev, [opportunityId]: result }));
      return result;
    },
    [computeCompliance],
  );

  // Apply a reviewer override, persist it, and recompute the snapshot so the
  // readiness gate reflects the change immediately.
  const applyReview = useCallback(
    (opportunityId, mutate) => {
      setComplianceReviews((prev) => {
        const current = prev[opportunityId] || { items: {}, risks: {} };
        const nextReviews = mutate({ items: { ...current.items }, risks: { ...current.risks } });
        const merged = { ...prev, [opportunityId]: nextReviews };
        // Recompute snapshot with the new overrides.
        const opportunity = getOpportunity(opportunityId);
        const qualification = qualifications[opportunityId];
        if (opportunity && qualification) {
          const result = buildComplianceResult(opportunity, qualification, proposals[opportunityId], documents, nextReviews);
          setComplianceResults((r) => (r[opportunityId] ? { ...r, [opportunityId]: result } : r));
        }
        return merged;
      });
    },
    [qualifications, proposals, documents],
  );

  const setReviewerState = useCallback((opportunityId, itemId, reviewerState) => {
    applyReview(opportunityId, (rev) => {
      rev.items[itemId] = { ...(rev.items[itemId] || {}), reviewerState };
      return rev;
    });
  }, [applyReview]);

  const setReviewerNote = useCallback((opportunityId, itemId, reviewerNote) => {
    applyReview(opportunityId, (rev) => {
      rev.items[itemId] = { ...(rev.items[itemId] || {}), reviewerNote };
      return rev;
    });
  }, [applyReview]);

  const setRiskStatus = useCallback((opportunityId, riskId, status) => {
    applyReview(opportunityId, (rev) => {
      rev.risks[riskId] = status;
      return rev;
    });
  }, [applyReview]);

  const value = useMemo(
    () => ({
      // workspace loaders (called by the auth flow + Settings)
      loadDemoWorkspace,
      resetWorkspaceBlank,

      // profile
      profile,
      updateCompanyProfile,
      updateProfile: updateCompanyProfile, // backwards-compatible alias

      // documents
      documents,
      addDocument,
      addDocuments,
      removeDocument,
      setDocumentType,
      updateDocumentStatus,

      // opportunities
      matches,
      setMatches,
      lastMatchRun,
      setLastMatchRun,
      opportunityStatuses,
      markOpportunityStatus,
      getOpportunityStatus,
      selectOpportunity,
      clearSelectedOpportunity,
      activeOpportunityId,
      setActiveOpportunityId,

      // qualification
      qualifications,
      saveMatchResult,
      saveQualification: saveMatchResult, // backwards-compatible alias

      // proposals
      proposals,
      ensureProposal,
      updateProposalSection,
      updateProposalStatus,

      // compliance
      complianceResults,
      complianceReviews,
      runComplianceCheck,
      computeCompliance,
      setReviewerState,
      setReviewerNote,
      setRiskStatus,

      // toast
      toast,
      showToast,
      dismissToast,

      // preferences
      resetDemo,
    }),
    [
      loadDemoWorkspace, resetWorkspaceBlank,
      profile, updateCompanyProfile,
      documents, addDocument, addDocuments, removeDocument, setDocumentType, updateDocumentStatus,
      matches, lastMatchRun, opportunityStatuses, markOpportunityStatus, getOpportunityStatus,
      selectOpportunity, clearSelectedOpportunity, activeOpportunityId,
      qualifications, saveMatchResult,
      proposals, ensureProposal, updateProposalSection, updateProposalStatus,
      complianceResults, complianceReviews, runComplianceCheck, computeCompliance,
      setReviewerState, setReviewerNote, setRiskStatus,
      toast, showToast, dismissToast,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

// Alias so imports can use the name from the Phase 3 spec.
export const useGrantPilot = useApp;
