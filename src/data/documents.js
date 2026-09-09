// Seed documents so the Documents and Compliance pages have shared state to
// work with from the first render. Users can add or remove these freely.
export const SEED_DOCUMENTS = [
  {
    id: 'seed-doc-1',
    name: 'Certificate-of-Incorporation.pdf',
    size: 384_000,
    type: 'Company Registration',
    status: 'Processed',
    uploadedAt: '2026-08-20T09:15:00.000Z',
  },
  {
    id: 'seed-doc-2',
    name: 'ISO-27001-Certificate.pdf',
    size: 512_000,
    type: 'Certificate',
    status: 'Processed',
    uploadedAt: '2026-08-22T11:40:00.000Z',
  },
];
