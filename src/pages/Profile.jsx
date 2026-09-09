import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, Save, Pencil, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Label } from '@/components/ui/input';
import { SectionHeading } from '@/components/common/SectionHeading';
import { TagInput } from '@/components/common/TagInput';
import {
  SECTORS, TECHNOLOGY_SUGGESTIONS, CERTIFICATION_SUGGESTIONS,
} from '@/data/sectors';

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-gov-red">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gov-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export default function Profile() {
  const { profile, updateProfile } = useApp();

  // A freshly registered account has no company name yet — open in edit mode.
  const [editing, setEditing] = useState(!profile.companyName);
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // Keep the local form in sync if the profile changes elsewhere.
  useEffect(() => { if (!editing) setForm(profile); }, [profile, editing]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setValue = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  function validate() {
    const next = {};
    if (!form.companyName?.trim()) next.companyName = 'Company name is required.';
    if (!form.sector) next.sector = 'Select a sector.';
    if (!form.capabilities?.trim()) next.capabilities = 'A short description of capabilities is required.';
    if (!form.technologies?.length) next.technologies = 'Add at least one technology.';
    if (form.experienceYears === '' || Number(form.experienceYears) < 0) next.experienceYears = 'Enter a valid number of years.';
    if (form.teamSize === '' || Number(form.teamSize) < 1) next.teamSize = 'Team size must be at least 1.';
    if (!form.location?.trim()) next.location = 'Location is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    updateProfile({
      ...form,
      experienceYears: Number(form.experienceYears),
      teamSize: Number(form.teamSize),
    });
    setEditing(false);
    setSaved(true);
  }

  function handleCancel() {
    setForm(profile);
    setErrors({});
    setEditing(false);
  }

  useEffect(() => {
    if (!saved) return undefined;
    const t = setTimeout(() => setSaved(false), 3500);
    return () => clearTimeout(t);
  }, [saved]);

  const readOnly = !editing;
  const disabledCls = useMemo(() => (readOnly ? 'bg-slate-50 text-gov-muted' : ''), [readOnly]);

  return (
    <div className="animate-fade-in">
      <SectionHeading
        title="Company Profile"
        description="This profile is used for all AI matching."
        action={
          readOnly ? (
            <Button onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="subtle" onClick={handleCancel}>
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" form="profile-form">
                <Save className="h-4 w-4" /> Save Profile
              </Button>
            </div>
          )
        }
      />

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-gov border border-gov-green/30 bg-gov-greenLight px-4 py-3 text-sm font-medium text-gov-green">
          <CheckCircle2 className="h-4 w-4" />
          Profile saved. All AI matching now uses these details.
        </div>
      )}

      <div className="mb-5 flex items-start gap-2 rounded-gov border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Keep this profile accurate and complete — every opportunity match, qualification score and
        generated proposal is derived from it.
      </div>

      <form id="profile-form" onSubmit={handleSave}>
        <Card className="mb-5">
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <Field label="Company name" htmlFor="companyName" error={errors.companyName}>
              <Input id="companyName" value={form.companyName} onChange={set('companyName')} disabled={readOnly} className={disabledCls} />
            </Field>
            <Field label="Sector" htmlFor="sector" error={errors.sector}>
              <Select id="sector" value={form.sector} onChange={set('sector')} disabled={readOnly} className={disabledCls}>
                <option value="">Select a sector</option>
                {SECTORS.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Sub-sector (optional)" htmlFor="subSector">
              <Input id="subSector" value={form.subSector} onChange={set('subSector')} disabled={readOnly} className={disabledCls} placeholder="e.g. Autonomous aerial surveillance" />
            </Field>
            <Field label="Location" htmlFor="location" error={errors.location}>
              <Input id="location" value={form.location} onChange={set('location')} disabled={readOnly} className={disabledCls} placeholder="City, State" />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Technologies" hint="Press Enter to add, or pick from suggestions." error={errors.technologies}>
                <TagInput value={form.technologies} onChange={setValue('technologies')} suggestions={TECHNOLOGY_SUGGESTIONS} disabled={readOnly} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Capabilities" htmlFor="capabilities" error={errors.capabilities}>
                <Textarea id="capabilities" rows={3} value={form.capabilities} onChange={set('capabilities')} disabled={readOnly} className={disabledCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Products" htmlFor="products">
                <Textarea id="products" rows={3} value={form.products} onChange={set('products')} disabled={readOnly} className={disabledCls} />
              </Field>
            </div>

            <Field label="Experience (years)" htmlFor="experienceYears" error={errors.experienceYears}>
              <Input id="experienceYears" type="number" min="0" value={form.experienceYears} onChange={set('experienceYears')} disabled={readOnly} className={disabledCls} />
            </Field>
            <Field label="Team size" htmlFor="teamSize" error={errors.teamSize}>
              <Input id="teamSize" type="number" min="1" value={form.teamSize} onChange={set('teamSize')} disabled={readOnly} className={disabledCls} />
            </Field>
            <Field label="Revenue" htmlFor="revenue" hint="e.g. ₹50L, ₹2 Cr">
              <Input id="revenue" value={form.revenue} onChange={set('revenue')} disabled={readOnly} className={disabledCls} />
            </Field>
            <Field label="Stage" htmlFor="stage">
              <Input id="stage" value={form.stage} onChange={set('stage')} disabled={readOnly} className={disabledCls} placeholder="e.g. Early Growth" />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Certifications" hint="Press Enter to add, or pick from suggestions.">
                <TagInput value={form.certifications} onChange={setValue('certifications')} suggestions={CERTIFICATION_SUGGESTIONS} disabled={readOnly} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Previous government projects" htmlFor="previousGovProjects">
                <Textarea id="previousGovProjects" rows={3} value={form.previousGovProjects} onChange={set('previousGovProjects')} disabled={readOnly} className={disabledCls} />
              </Field>
            </div>
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex justify-end gap-2">
            <Button variant="subtle" type="button" onClick={handleCancel}>Cancel</Button>
            <Button type="submit">
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
