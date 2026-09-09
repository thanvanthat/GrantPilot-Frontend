// ---------------------------------------------------------------------------
// SNS Workbench backend connection
//
// The backend handles: PDF text extraction, RFP analysis, requirement
// structuring, eligibility checking, capability matching, gap analysis,
// bid-fit scoring, bid decision, report generation and proposal generation.
//
// The frontend sends { company profile + document data } and receives
// { scores, analysis, recommendations } as JSON.
// ---------------------------------------------------------------------------

// TODO: Replace with SNS Workbench webhook URL
export const API_URL = 'https://your-sns-workbench-url.com/api/workflow';

export async function callSNSWorkbench(data) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('SNS Workbench API error:', error);
    return null;
  }
}

/**
 * Simulates the latency of an AI workflow so loading states are exercised
 * while the SNS Workbench endpoint is not yet wired up.
 */
export function simulateAiDelay(ms = 1600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
