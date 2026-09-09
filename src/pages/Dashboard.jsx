import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target, TrendingUp, FileText, CalendarClock,
  Search, FolderUp, PenLine, ArrowRight, Building2,
  Eye, CheckCircle2, XCircle, Sparkles, Gauge, ShieldCheck, AlertTriangle, FolderUp as FolderIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatCounter } from '@/components/common/StatCounter';
import { SectorBadge } from '@/components/common/SectorBadge';
import { MatchScore } from '@/components/common/MatchScore';
import { isProfileComplete } from '@/data/profile';
import { AttentionPanel } from '@/components/dashboard/AttentionPanel';
import { usePortfolioRows } from '@/hooks/usePortfolio';
import { calculateProposalMetrics, getAttentionItems } from '@/utils/reportingEngine';

function QuickAction({ icon: Icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-gov border border-gov-border bg-white p-5 shadow-card transition-shadow hover:shadow-cardHover"
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-gov bg-saffron-50 text-saffron-600">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <h3 className="text-sm font-bold text-navy-900">{title}</h3>
      <p className="mt-1 flex-1 text-xs text-gov-muted">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron-600">
        Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, matches, documents, getOpportunityStatus, qualifications, complianceResults, proposals } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const rows = usePortfolioRows();
  const proposalM = useMemo(() => calculateProposalMetrics(proposals), [proposals]);
  const attentionItems = useMemo(() => getAttentionItems(rows), [rows]);

  // Every counter below is derived from shared context — nothing hard-coded.
  const totalOpportunities = matches.length;
  const countByStatus = (status) => matches.filter((o) => getOpportunityStatus(o.id) === status).length;
  const reviewing = countByStatus('Reviewing');
  const pursuing = countByStatus('Pursuing');
  const skipped = countByStatus('Skipped');
  const documentCount = documents.length;

  // Qualification summary — derived only from opportunities actually analysed.
  const analysed = Object.values(qualifications);
  const analysedCount = analysed.length;
  const strongMatches = analysed.filter((q) => q.overallScore >= 80).length;
  const averageMatch = analysedCount
    ? Math.round(analysed.reduce((sum, q) => sum + q.overallScore, 0) / analysedCount)
    : 0;
  const upcomingDeadlines = matches.filter((o) => o.deadline <= 35).length;

  // Compliance summary — derived from computed compliance snapshots.
  const complianceList = Object.values(complianceResults);
  const underComplianceReview = complianceList.length;
  const complianceReady = complianceList.filter((c) => c.readinessStatus === 'READY').length;
  const complianceNeedsAttention = complianceList.filter((c) => c.readinessStatus === 'NEEDS_ATTENTION' || c.readinessStatus === 'MINOR_REVIEW').length;
  const complianceNotReady = complianceList.filter((c) => c.readinessStatus === 'NOT_READY').length;

  const recommended = [...matches].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  const profileReady = isProfileComplete(profile);

  return (
    <div className="animate-fade-in">
      {/* Welcome banner */}
      <div className="mb-6 overflow-hidden rounded-gov border border-gov-border bg-white shadow-card">
        <div className="tricolour-strip" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-medium text-gov-muted">
              {t('dashboard.welcome', { name: user?.name || '' })}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
              {profile.companyName || t('dashboard.company')}
            </h1>
            <p className="mt-1 text-sm text-gov-muted">
              {profileReady
                ? t('dashboard.readySubtitle', { sector: profile.sector, location: profile.location })
                : t('dashboard.setupSubtitle')}
            </p>
          </div>
          {profileReady ? (
            <Button onClick={() => navigate('/opportunities')}>
              <Search className="h-4 w-4" />
              {t('dashboard.findOpportunities')}
            </Button>
          ) : (
            <Button onClick={() => navigate('/profile')}>
              <Building2 className="h-4 w-4" />
              {t('dashboard.completeProfile')}
            </Button>
          )}
        </div>
      </div>

      {/* Stat counters — all derived from shared context */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCounter icon={Target} value={totalOpportunities} label={t('dashboard.totalOpportunities')} accent="saffron" />
        <StatCounter icon={Sparkles} value={analysedCount} label={t('dashboard.analyzed')} accent="navy" />
        <StatCounter icon={TrendingUp} value={strongMatches} label={t('dashboard.strongMatches')} accent="green" />
        <StatCounter icon={Gauge} value={analysedCount ? `${averageMatch}%` : '—'} label={t('dashboard.avgMatch')} accent="amber" />
        <StatCounter icon={Eye} value={reviewing} label={t('dashboard.underReview')} accent="navy" />
        <StatCounter icon={CheckCircle2} value={pursuing} label={t('dashboard.pursuing')} accent="green" />
        <StatCounter icon={XCircle} value={skipped} label={t('dashboard.skipped')} accent="amber" />
        <StatCounter icon={FolderIcon} value={documentCount} label={t('dashboard.documents')} accent="navy" />
      </div>

      {/* Proposals summary */}
      <SectionHeading title={t('dashboard.proposalsTitle')} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCounter icon={FileText} value={proposalM.total} label={t('dashboard.proposalsCount')} accent="saffron" />
        <StatCounter icon={PenLine} value={proposalM.draft} label={t('dashboard.draft')} accent="navy" />
        <StatCounter icon={Eye} value={proposalM.inReview} label={t('dashboard.inReview')} accent="amber" />
        <StatCounter icon={Gauge} value={proposalM.total ? `${proposalM.averageReadiness}%` : '—'} label={t('dashboard.avgProposalReadiness')} accent="green" />
      </div>

      {/* Compliance summary — derived from compliance snapshots */}
      <SectionHeading title={t('dashboard.complianceTitle')} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCounter icon={ShieldCheck} value={underComplianceReview} label={t('dashboard.underComplianceReview')} accent="navy" />
        <StatCounter icon={CheckCircle2} value={complianceReady} label={t('dashboard.complianceReady')} accent="green" />
        <StatCounter icon={AlertTriangle} value={complianceNeedsAttention} label={t('dashboard.needsAttention')} accent="amber" />
        <StatCounter icon={XCircle} value={complianceNotReady} label={t('dashboard.notReady')} accent="amber" />
      </div>

      {/* Attention panel */}
      {attentionItems.length > 0 && (
        <>
          <SectionHeading title={t('dashboard.needsAttentionTitle')} description={t('dashboard.needsAttentionDesc')} />
          <div className="mb-8"><AttentionPanel items={attentionItems} limit={6} /></div>
        </>
      )}

      {/* Recommended opportunities */}
      <SectionHeading
        title={t('dashboard.topRecommended')}
        description={t('dashboard.topRecommendedDesc')}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/opportunities')}>
            {t('common.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {recommended.map((o) => (
          <Card key={o.id} className="flex flex-col transition-shadow hover:shadow-cardHover">
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <SectorBadge sector={o.sector} />
                <span className="text-xs font-medium text-gov-muted">{o.type}</span>
              </div>
              <h3 className="text-sm font-bold leading-snug text-navy-900">{o.title}</h3>
              <p className="mt-1 text-xs text-gov-muted">{o.organization}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gov-ink">
                <span className="font-semibold">{o.budget}</span>
                <span className="text-gov-muted">·</span>
                <span>{o.deadline} days left</span>
              </div>
              <div className="mt-4">
                <MatchScore score={o.matchScore} />
              </div>
              <Link
                to={`/opportunities/${o.id}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron-600 hover:underline"
              >
                {t('common.viewDetails')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <SectionHeading title={t('dashboard.quickActions')} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <QuickAction icon={Search} title="Find Opportunities" description="Browse and match government opportunities to your profile." to="/opportunities" />
        <QuickAction icon={FolderUp} title="Upload Document" description="Add certificates, reports and tenders for qualification." to="/documents" />
        <QuickAction icon={PenLine} title="Build Proposal" description="Draft and refine proposals section by section." to="/proposals" />
      </div>

      {/* Company summary */}
      <SectionHeading title={t('dashboard.companySummary')} />
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-gov bg-navy-50 text-navy-900">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy-900">{profile.companyName}</p>
                <p className="text-xs text-gov-muted">{profile.subSector || profile.sector}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>Edit Profile</Button>
          </div>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-gov-muted">Experience</dt>
              <dd className="font-semibold text-gov-ink">{profile.experienceYears} years</dd>
            </div>
            <div>
              <dt className="text-xs text-gov-muted">Team size</dt>
              <dd className="font-semibold text-gov-ink">{profile.teamSize}</dd>
            </div>
            <div>
              <dt className="text-xs text-gov-muted">Revenue</dt>
              <dd className="font-semibold text-gov-ink">{profile.revenue}</dd>
            </div>
            <div>
              <dt className="text-xs text-gov-muted">Certifications</dt>
              <dd className="font-semibold text-gov-ink">{profile.certifications.length}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.technologies.map((tech) => (
              <span key={tech} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-900">{tech}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
