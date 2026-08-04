import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, SaveStatus, SectionKey } from './types';
import { authService, AuthUser } from './services/authService';
import { resumeService } from './services/resumeService';
import { AuthPage } from './components/auth/AuthPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
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
import { ResumePreview } from './components/preview/ResumePreview';
import { ToastProvider, useToast } from './components/ui/Toast';
import { BuyMeCoffeeModal } from './components/ui/BuyMeCoffeeModal';
import {
  User,
  FileText,
  Briefcase,
  Code,
  GraduationCap,
  FolderGit2,
  Award,
  ArrowRight,
  Plus,
  Layers,
  Loader2,
} from 'lucide-react';

type FormTabKey = SectionKey | 'personalInfo' | 'introduction';

function AppContent() {
  const { showToast } = useToast();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<FormTabKey>('personalInfo');
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const activeResumeRef = useRef<ResumeData | null>(null);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);
  const formTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Modals state
  const [isAtsCheckOpen, setIsAtsCheckOpen] = useState(false);
  const [isSectionOrderOpen, setIsSectionOrderOpen] = useState(false);
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);

  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordPage />;
  }

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
    setResumes(list);
  };

  const getResumeSnapshot = (resume: ResumeData) => {
    const { updatedAt, ...content } = resume;
    return JSON.stringify(content);
  };

  useEffect(() => {
    activeResumeRef.current = activeResume;
  }, [activeResume]);

  useEffect(() => {
    formTabRefs.current[activeFormTab]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeFormTab]);

  const saveActiveResume = async (resumeToSave = activeResume, showSuccessToast = false) => {
    if (!resumeToSave) return;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const savingSnapshot = getResumeSnapshot(resumeToSave);
    setSaveStatus('saving');
    const res = await resumeService.saveResume(resumeToSave);

    if (res.success && res.resume) {
      lastSavedSnapshotRef.current = getResumeSnapshot(res.resume);
      const currentResume = activeResumeRef.current;
      const hasNewerLocalChanges = currentResume?.id === res.resume.id
        && getResumeSnapshot(currentResume) !== savingSnapshot;

      if (!hasNewerLocalChanges) {
        setActiveResume((current) =>
          current?.id === res.resume?.id ? res.resume : current
        );
      }
      setResumes((prev) =>
        prev.map((item) => (item.id === res.resume?.id ? res.resume : item))
      );
      setSaveStatus(hasNewerLocalChanges ? 'unsaved' : 'saved');
      if (showSuccessToast) {
        showToast('Resume saved', 'Your latest progress is synced.', 'success');
      }
      return;
    }

    setSaveStatus('error');
    showToast('Save failed', res.error || 'Failed to sync resume changes', 'error');
  };

  const handleAuthSuccess = async (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    await loadResumes(loggedInUser.id);
    showToast(
      loggedInUser.isGuest ? 'Guest Mode' : 'Welcome!',
      loggedInUser.isGuest ? 'Progress is kept only until refresh.' : `Signed in as ${loggedInUser.fullName || loggedInUser.email}`,
      'success'
    );
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

    const currentSnapshot = getResumeSnapshot(activeResume);
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('unsaved');
    saveTimerRef.current = window.setTimeout(() => {
      saveActiveResume(activeResume);
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [activeResume]);

  const handleSelectResume = async (id: string) => {
    if (!user) return;
    const item = await resumeService.getResumeById(id, user.id);
    if (item) {
      lastSavedSnapshotRef.current = getResumeSnapshot(item);
      setSaveStatus('saved');
      setActiveResumeId(id);
      setActiveResume(item);
    }
  };

  const handleCreateNewResume = async () => {
    if (!user) return;
    const title = `Resume #${resumes.length + 1}`;
    try {
      const newResume = await resumeService.createResume(user.id, title);
      lastSavedSnapshotRef.current = getResumeSnapshot(newResume);
      setSaveStatus('saved');
      setResumes([newResume, ...resumes]);
      setActiveResumeId(newResume.id);
      setActiveResume(newResume);
      showToast('New Resume Created', 'Blank resume initialized.', 'success');
    } catch (error: any) {
      showToast('Create failed', error?.message || 'Unable to create resume.', 'error');
    }
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
  const formTabs: Array<{ id: FormTabKey; label: string; icon: React.ElementType }> = [
    { id: 'personalInfo', label: 'Personal Info', icon: User },
    { id: 'introduction', label: 'Summary', icon: FileText },
    { id: 'workExperience', label: 'Work Experience', icon: Briefcase },
    { id: 'technicalSkills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];
  const activeFormIndex = formTabs.findIndex((tab) => tab.id === activeFormTab);
  const nextFormTab = activeFormIndex >= 0 ? formTabs[activeFormIndex + 1] : null;

  const handleNextSection = () => {
    if (!nextFormTab) return;
    setActiveFormTab(nextFormTab.id);
    editorScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            onOpenCoffee={() => setIsCoffeeOpen(true)}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
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
                <button
                  type="button"
                  onClick={handleCreateNewResume}
                  className="mt-5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors inline-flex items-center space-x-1.5"
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
            onSave={() => saveActiveResume(activeResume, true)}
            isGuest={Boolean(user.isGuest)}
            onOpenSectionOrder={() => setIsSectionOrderOpen(true)}
            onOpenCoffee={() => setIsCoffeeOpen(true)}
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
                      ref={(element) => {
                        formTabRefs.current[tab.id] = element;
                      }}
                      type="button"
                      onClick={() => setActiveFormTab(tab.id)}
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
              <div ref={editorScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {activeFormTab === 'personalInfo' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Personal Contact Information</h2>
                      </div>
                      <PersonalDetailsForm
                        data={activeResume.personalInfo}
                        profileImage={activeResume.profileImage}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, personalInfo: updated })
                        }
                        onProfileImageChange={(updated) =>
                          setActiveResume({
                            ...activeResume,
                            profileImage: updated,
                            layout: updated ? 'photo' : activeResume.layout,
                          })
                        }
                      />
                    </div>
                  )}

                  {activeFormTab === 'introduction' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold text-slate-900">Professional Summary</h2>
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
                      </div>
                      <CertificationsForm
                        items={activeResume.certifications}
                        onChange={(updated) =>
                          setActiveResume({ ...activeResume, certifications: updated })
                        }
                      />
                    </div>
                  )}

                  {nextFormTab && (
                    <div className="flex justify-end border-t border-slate-200 pt-5">
                      <button
                        type="button"
                        onClick={handleNextSection}
                        className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                      >
                        <span>Next: {nextFormTab.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
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
            layout={activeResume.layout}
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
            onUpdateLayout={(layout) =>
              setActiveResume({ ...activeResume, layout })
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
        </div>
      )}

      <BuyMeCoffeeModal
        isOpen={isCoffeeOpen}
        onClose={() => setIsCoffeeOpen(false)}
      />
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
