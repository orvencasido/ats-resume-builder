import React, { useState, useEffect } from 'react';
import { ResumeData, SaveStatus, SectionKey } from './types';
import { authService, AuthUser } from './services/authService';
import { resumeService } from './services/resumeService';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { ResumeCard } from './components/dashboard/ResumeCard';
import { BuilderHeader } from './components/builder/BuilderHeader';
import { PersonalDetailsForm } from './components/builder/PersonalDetailsForm';
import { IntroductionForm } from './components/builder/IntroductionForm';
import { WorkExperienceForm } from './components/builder/WorkExperienceForm';
import { TechnicalSkillsForm } from './components/builder/TechnicalSkillsForm';
import { EducationForm } from './components/builder/EducationForm';
import { ProjectsForm } from './components/builder/ProjectsForm';
import { CertificationsForm } from './components/builder/CertificationsForm';
import { AtsCheckPanel } from './components/builder/AtsCheckPanel';
import { SectionOrderModal } from './components/builder/SectionOrderModal';
import { SampleDataModal } from './components/builder/SampleDataModal';
import { ResumePreview } from './components/preview/ResumePreview';
import { ToastProvider, useToast } from './components/ui/Toast';
import { SAMPLE_RESUME } from './data/sampleData';
import {
  User,
  FileText,
  Briefcase,
  Code,
  GraduationCap,
  FolderGit2,
  Award,
  Plus,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

function AppContent() {
  const { showToast } = useToast();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<SectionKey | 'personalInfo' | 'introduction'>('personalInfo');
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  // Modals state
  const [isAtsCheckOpen, setIsAtsCheckOpen] = useState(false);
  const [isSectionOrderOpen, setIsSectionOrderOpen] = useState(false);
  const [isSampleDataOpen, setIsSampleDataOpen] = useState(false);

  // Initialize user session & load resumes
  useEffect(() => {
    async function initSession() {
      setIsCheckingAuth(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await loadResumes(currentUser.id);
      }
      setIsCheckingAuth(false);
    }
    initSession();
  }, []);

  const loadResumes = async (userId: string) => {
    const list = await resumeService.getResumes(userId);
    if (list.length === 0) {
      // Create initial sample resume if empty
      const sample = await resumeService.createResume(userId, 'Software Engineering Resume', true);
      setResumes([sample]);
    } else {
      setResumes(list);
    }
  };

  const handleAuthSuccess = async (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    await loadResumes(loggedInUser.id);
    showToast('Welcome!', `Signed in as ${loggedInUser.fullName || loggedInUser.email}`, 'success');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setActiveResumeId(null);
    setActiveResume(null);
    setResumes([]);
    showToast('Logged Out', 'You have been signed out.', 'info');
  };

  // Auto-save logic debounced for editor
  useEffect(() => {
    if (!activeResume) return;

    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const res = await resumeService.saveResume(activeResume);
      if (res.success) {
        setSaveStatus('saved');
        setResumes((prev) =>
          prev.map((r) => (r.id === activeResume.id ? activeResume : r))
        );
      } else {
        setSaveStatus('error');
        showToast('Save failed', res.error || 'Failed to sync resume changes', 'error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [activeResume]);

  const handleSelectResume = async (id: string) => {
    if (!user) return;
    const item = await resumeService.getResumeById(id, user.id);
    if (item) {
      setActiveResumeId(id);
      setActiveResume(item);
    }
  };

  const handleCreateNewResume = async () => {
    if (!user) return;
    const title = `Resume #${resumes.length + 1}`;
    const newResume = await resumeService.createResume(user.id, title, true);
    setResumes([newResume, ...resumes]);
    setActiveResumeId(newResume.id);
    setActiveResume(newResume);
    showToast('New Resume Created', 'Sample ATS resume template initialized.', 'success');
  };

  const handleDuplicateResume = async (id: string) => {
    if (!user) return;
    const duplicated = await resumeService.duplicateResume(id, user.id);
    if (duplicated) {
      setResumes([duplicated, ...resumes]);
      showToast('Resume Duplicated', `Created copy of ${duplicated.title}`, 'success');
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this resume?')) {
      await resumeService.deleteResume(id, user.id);
      const remaining = resumes.filter((r) => r.id !== id);
      setResumes(remaining);
      if (activeResumeId === id) {
        setActiveResumeId(null);
        setActiveResume(null);
      }
      showToast('Resume Deleted', 'The resume has been removed.', 'info');
    }
  };

  const handleLoadSampleData = () => {
    if (!activeResume) return;
    setActiveResume({
      ...activeResume,
      personalInfo: SAMPLE_RESUME.personalInfo,
      introduction: SAMPLE_RESUME.introduction,
      workExperiences: SAMPLE_RESUME.workExperiences,
      technicalSkills: SAMPLE_RESUME.technicalSkills,
      education: SAMPLE_RESUME.education,
      projects: SAMPLE_RESUME.projects,
      certifications: SAMPLE_RESUME.certifications,
    });
    showToast('Sample Data Loaded', 'Sample resume content populated.', 'success');
  };

  // Completion calculation for active resume
  let completionPercentage = 0;
  if (activeResume) {
    let filled = 0;
    const total = 5;
    if (activeResume.personalInfo?.fullName) filled++;
    if (activeResume.introduction) filled++;
    if (activeResume.workExperiences?.length > 0) filled++;
    if (activeResume.technicalSkills?.length > 0) filled++;
    if (activeResume.education?.length > 0) filled++;
    completionPercentage = Math.round((filled / total) * 100);
  }

  // Navigation tab definitions
  const formTabs = [
    { id: 'personalInfo', label: 'Personal Info', icon: User },
    { id: 'introduction', label: 'Summary', icon: FileText },
    { id: 'workExperience', label: 'Work Experience', icon: Briefcase },
    { id: 'technicalSkills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-300">Loading ATS Resume Builder...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* DASHBOARD VIEW */}
      {!activeResume ? (
        <div className="flex-1 flex flex-col">
          <DashboardHeader
            user={user}
            onLogout={handleLogout}
            onCreateNew={handleCreateNewResume}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
            {/* Hero welcome card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  ATS-Friendly Document Generator
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                  Build Resumes That Get Past Applicant Tracking Systems
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Create clean, machine-readable resume PDF documents formatted strictly according to corporate HR ATS standards. Fully customizable, instant PDF downloads, selectable vector text, and cloud sync.
                </p>
                <button
                  type="button"
                  onClick={handleCreateNewResume}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Professional Resume</span>
                </button>
              </div>

              {/* Decorative accent background shapes */}
              <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-40 -top-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Resume grid section */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Your Resumes ({resumes.length})</span>
              </h3>
            </div>

            {resumes.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base mb-1">No Resumes Found</h4>
                <p className="text-slate-500 text-xs mb-6">
                  Start building your first ATS-optimized resume in minutes.
                </p>
                <button
                  type="button"
                  onClick={handleCreateNewResume}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Resume</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {resumes.map((item) => (
                  <ResumeCard
                    key={item.id}
                    resume={item}
                    onEdit={handleSelectResume}
                    onDuplicate={handleDuplicateResume}
                    onDelete={handleDeleteResume}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      ) : (
        /* RESUME BUILDER VIEW */
        <div className="flex flex-col h-screen overflow-hidden">
          <BuilderHeader
            data={activeResume}
            saveStatus={saveStatus}
            onBack={() => {
              setActiveResumeId(null);
              setActiveResume(null);
            }}
            onTitleChange={(newTitle) => {
              setActiveResume({ ...activeResume, title: newTitle });
            }}
            onOpenSectionOrder={() => setIsSectionOrderOpen(true)}
            onOpenAtsCheck={() => setIsAtsCheckOpen(true)}
            onOpenSampleData={() => setIsSampleDataOpen(true)}
            activeMobileTab={activeMobileTab}
            onMobileTabChange={setActiveMobileTab}
            completionPercentage={completionPercentage}
          />

          {/* Builder Split Layout Container */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT SIDE: FORM EDITOR */}
            <div
              className={`w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-white ${
                activeMobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Form Navigation Tabs */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 overflow-x-auto flex space-x-1 shrink-0 no-scrollbar">
                {formTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeFormTab === tab.id;
                  const isHidden = activeResume.hiddenSections?.includes(tab.id as SectionKey);

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFormTab(tab.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : isHidden
                          ? 'text-slate-400 hover:text-slate-600 line-through'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {activeFormTab === 'personalInfo' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Personal Contact Information</h2>
                        <p className="text-xs text-slate-500">
                          Primary candidate details displayed at the top of your ATS document header.
                        </p>
                      </div>
                      <PersonalDetailsForm
                        data={activeResume.personalInfo}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, personalInfo: updated })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'introduction' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Professional Summary</h2>
                        <p className="text-xs text-slate-500">
                          A high-impact 2-4 sentence opening statement summarizing core skills and experience.
                        </p>
                      </div>
                      <IntroductionForm
                        value={activeResume.introduction}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, introduction: updated })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'workExperience' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
                        <p className="text-xs text-slate-500">
                          Add job roles, company names, employment dates, and action-oriented achievement bullet points.
                        </p>
                      </div>
                      <WorkExperienceForm
                        items={activeResume.workExperiences}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, workExperiences: updated })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'technicalSkills' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Technical Skills</h2>
                        <p className="text-xs text-slate-500">
                          Organize your technical proficiencies, frameworks, languages, and tools into categories.
                        </p>
                      </div>
                      <TechnicalSkillsForm
                        items={activeResume.technicalSkills}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, technicalSkills: updated })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'education' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Education</h2>
                        <p className="text-xs text-slate-500">
                          Academic degrees, majors, university names, and graduation dates.
                        </p>
                      </div>
                      <EducationForm
                        items={activeResume.education}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, education: updated })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'projects' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Projects</h2>
                        <p className="text-xs text-slate-500">
                          Key engineering projects, open-source work, or portfolio achievements.
                        </p>
                      </div>
                      <ProjectsForm
                        items={activeResume.projects}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, projects: updated })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'certifications' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Certifications</h2>
                        <p className="text-xs text-slate-500">
                          Professional licenses, cloud certifications (AWS, Azure, GCP), and credentials.
                        </p>
                      </div>
                      <CertificationsForm
                        items={activeResume.certifications}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, certifications: updated })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: LIVE PDF PREVIEW CANVAS */}
            <div
              className={`w-full lg:w-1/2 flex flex-col bg-slate-200/70 ${
                activeMobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <ResumePreview data={activeResume} className="flex-1 rounded-none border-none" />
            </div>
          </div>

          {/* Section Order Modal */}
          <SectionOrderModal
            isOpen={isSectionOrderOpen}
            onClose={() => setIsSectionOrderOpen(false)}
            sectionOrder={activeResume.sectionOrder}
            hiddenSections={activeResume.hiddenSections}
            pageSize={activeResume.pageSize}
            pageMargins={activeResume.pageMargins}
            fontSize={activeResume.fontSize}
            lineHeight={activeResume.lineHeight}
            onUpdateOrder={(newOrder) =>
              setActiveResume({ ...activeResume, sectionOrder: newOrder })
            }
            onToggleHide={(key) => {
              const current = activeResume.hiddenSections || [];
              const updated = current.includes(key)
                ? current.filter((k) => k !== key)
                : [...current, key];
              setActiveResume({ ...activeResume, hiddenSections: updated });
            }}
            onUpdatePageSize={(size) =>
              setActiveResume({ ...activeResume, pageSize: size })
            }
            onUpdatePageMargins={(margins) =>
              setActiveResume({ ...activeResume, pageMargins: margins })
            }
            onUpdateFontSize={(size) =>
              setActiveResume({ ...activeResume, fontSize: size })
            }
            onUpdateLineHeight={(height) =>
              setActiveResume({ ...activeResume, lineHeight: height })
            }
          />
          {/* ATS Compliance Checker Panel */}
          <AtsCheckPanel
            isOpen={isAtsCheckOpen}
            onClose={() => setIsAtsCheckOpen(false)}
            data={activeResume}
          />

          {/* Load Sample Data Confirmation Modal */}
          <SampleDataModal
            isOpen={isSampleDataOpen}
            onClose={() => setIsSampleDataOpen(false)}
            onConfirm={handleLoadSampleData}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
