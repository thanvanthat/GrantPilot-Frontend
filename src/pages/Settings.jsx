import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Globe, AlertTriangle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, Label } from '@/components/ui/input';
import { SectionHeading } from '@/components/common/SectionHeading';

function ConfirmResetDialog({ t, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t('settings.resetConfirmTitle')} className="w-full max-w-md rounded-gov border border-gov-border bg-white shadow-cardHover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-gov-border p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gov-amber" />
            <h2 className="text-base font-bold text-navy-900">{t('settings.resetConfirmTitle')}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t('common.cancel')}><X className="h-5 w-5 text-gov-muted" /></button>
        </div>
        <div className="p-5 text-sm text-gov-ink">{t('settings.resetConfirmBody')}</div>
        <div className="flex justify-end gap-2 border-t border-gov-border p-5">
          <Button variant="subtle" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={onConfirm}><RotateCcw className="h-4 w-4" /> {t('settings.resetDemo')}</Button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { showToast, resetDemo } = useApp();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const [confirm, setConfirm] = useState(false);

  async function handleSignOut() {
    await signOut();
    showToast(t('toast.signedOut'));
    navigate('/login', { replace: true });
  }

  function doReset() {
    resetDemo();
    setConfirm(false);
    showToast(t('toast.demoReset'));
    navigate('/dashboard');
  }

  function onLanguageChange(e) {
    setLanguage(e.target.value);
    const lang = supportedLanguages.find((l) => l.code === e.target.value);
    showToast(t('toast.languageSet', { lang: lang ? lang.nativeName : e.target.value }));
  }

  return (
    <div className="animate-fade-in">
      <SectionHeading title={t('settings.title')} description={t('settings.subtitle')} />

      <div className="grid max-w-2xl gap-5">
        {/* Account */}
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-sm font-bold text-navy-900">{t('settings.account')}</h2>
              <p className="text-sm text-gov-muted">{user?.name}{user?.email ? ` · ${user.email}` : ''}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/account')}>{t('settings.viewProfile')}</Button>
              <Button variant="subtle" onClick={handleSignOut}>{t('common.signOut')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-navy-900"><Globe className="h-4 w-4" /> {t('settings.language')}</h2>
            <p className="mb-3 text-sm text-gov-muted">{t('settings.languageDesc')}</p>
            <Label htmlFor="settings-language">{t('settings.displayLanguage')}</Label>
            <Select id="settings-language" value={language} onChange={onLanguageChange} className="max-w-xs">
              {supportedLanguages.map((l) => <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>)}
            </Select>
          </CardContent>
        </Card>

        {/* Reset demo data */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-navy-900"><RotateCcw className="h-4 w-4" /> {t('settings.demoData')}</h2>
            <p className="mb-3 text-sm text-gov-muted">{t('settings.demoDataDesc')}</p>
            <Button variant="outline" onClick={() => setConfirm(true)}><RotateCcw className="h-4 w-4" /> {t('settings.resetDemo')}</Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-1 text-sm font-bold text-navy-900">{t('settings.about')}</h2>
            <p className="text-sm text-gov-muted">{t('settings.aboutBody')}</p>
          </CardContent>
        </Card>
      </div>

      {confirm && <ConfirmResetDialog t={t} onConfirm={doReset} onClose={() => setConfirm(false)} />}
    </div>
  );
}
