import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle2, Mail, ShieldCheck, Building2, Globe, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { initials } from '@/lib/utils';

const PROVIDER_LABEL = { password: 'Email & password', google: 'Google account' };
const TYPE_LABEL = { personal: 'Personal account', company: 'Company account' };

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-gov-border py-3 last:border-0">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-gov bg-navy-50 text-navy-900">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">{label}</p>
        <p className="text-sm font-medium text-navy-900">{value}</p>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { profile, showToast } = useApp();
  const { user, signOut } = useAuth();
  const { t, language, supportedLanguages } = useLanguage();

  const langLabel = supportedLanguages.find((l) => l.code === language)?.nativeName || 'English';

  async function handleSignOut() {
    await signOut();
    showToast(t('toast.signedOut'));
    navigate('/login', { replace: true });
  }

  return (
    <div className="animate-fade-in">
      {/* Back — returns to the previous screen */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <SectionHeading title={t('nav.userProfile')} description={t('settings.subtitle')} />

      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        {/* Identity card */}
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-saffron-500 text-xl font-extrabold text-white">
              {initials(user?.name) || 'GP'}
            </span>
            <p className="text-lg font-bold text-navy-900">{user?.name || 'GrantPilot User'}</p>
            <p className="text-sm text-gov-muted">{user?.email}</p>
            <Button variant="subtle" className="mt-4 w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> {t('common.signOut')}
            </Button>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-2 text-sm font-bold text-navy-900">Account</h2>
              <Row icon={UserCircle2} label="Full name" value={user?.name || '—'} />
              <Row icon={Mail} label="Email" value={user?.email || '—'} />
              <Row icon={ShieldCheck} label="Sign-in method" value={PROVIDER_LABEL[user?.provider] || 'Email & password'} />
              <Row icon={Building2} label="Account type" value={TYPE_LABEL[user?.type] || 'Personal account'} />
              <Row icon={Globe} label="Preferred language" value={langLabel} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <h2 className="text-sm font-bold text-navy-900">Company profile</h2>
                <p className="text-sm text-gov-muted">
                  {profile.companyName ? `${profile.companyName}${profile.sector ? ` · ${profile.sector}` : ''}` : 'Not set up yet'}
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <Building2 className="h-4 w-4" /> {t('settings.viewProfile')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
