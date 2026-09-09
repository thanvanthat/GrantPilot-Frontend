import { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { DOCUMENT_TYPES } from '@/data/sectors';
import { processDocument } from '@/services/snsWorkbench';
import { formatBytes, cn } from '@/lib/utils';

let idCounter = 0;
const nextId = () => `doc-${Date.now()}-${idCounter++}`;

const DOC_STATUS_STYLES = {
  Uploaded: 'bg-slate-100 text-slate-600',
  Processing: 'bg-gov-amberLight text-gov-amber',
  Processed: 'bg-gov-greenLight text-gov-green',
  'Review Required': 'bg-gov-redLight text-gov-red',
};

function DocStatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', DOC_STATUS_STYLES[status] || DOC_STATUS_STYLES.Uploaded)}>
      {status === 'Processing' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status}
    </span>
  );
}

export default function Documents() {
  const { documents, addDocument, removeDocument, setDocumentType, updateDocumentStatus } = useApp();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  function handleFiles(fileList) {
    setError('');
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const rejected = files.filter((f) => f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'));
    const accepted = files.filter((f) => !rejected.includes(f));

    if (rejected.length) {
      setError(`Only PDF files are accepted. Skipped: ${rejected.map((f) => f.name).join(', ')}`);
    }
    if (!accepted.length) return;

    // Add each document immediately as "Processing", then simulate the SNS
    // Workbench extraction round-trip and flip it to "Processed".
    accepted.forEach((f) => {
      const id = nextId();
      const doc = {
        id,
        name: f.name,
        size: f.size,
        type: 'Certificate',
        status: 'Processing',
        uploadedAt: new Date().toISOString(),
      };
      addDocument(doc);
      // React Page -> Service -> snsWorkbench (mock now, SNS Workbench later)
      processDocument(doc).then((processed) => updateDocumentStatus(id, processed.status));
    });
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="animate-fade-in">
      <SectionHeading
        title="Document Upload"
        description="Upload certificates, reports and tender documents. These are sent for AI text extraction when the SNS Workbench backend is connected."
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-gov border-2 border-dashed bg-white px-6 py-12 text-center transition-colors',
          dragging ? 'border-saffron-500 bg-saffron-50' : 'border-gov-border hover:border-saffron-400',
        )}
      >
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-saffron-50 text-saffron-600">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm font-semibold text-navy-900">
          Drag &amp; drop PDF files here, or <span className="text-saffron-600">browse</span>
        </p>
        <p className="mt-1 text-xs text-gov-muted">PDF only · multiple files supported</p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-gov border border-gov-red/30 bg-gov-redLight px-4 py-3 text-sm font-medium text-gov-red">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* File list */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Uploaded Documents ({documents.length})</h3>
        </div>

        {documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded" description="Drag and drop PDF files above to add them to your document library." />
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gov-border">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-gov bg-navy-50 text-navy-900">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900">{doc.name}</p>
                      <p className="text-xs text-gov-muted">
                        {formatBytes(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <DocStatusBadge status={doc.status || 'Processed'} />
                    <Select
                      value={doc.type}
                      onChange={(e) => setDocumentType(doc.id, e.target.value)}
                      className="h-9 w-full max-w-[15rem] sm:w-auto"
                      aria-label={`Document type for ${doc.name}`}
                    >
                      {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeDocument(doc.id)} aria-label={`Remove ${doc.name}`} className="text-gov-muted hover:text-gov-red">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
