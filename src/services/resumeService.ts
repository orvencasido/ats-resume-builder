import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  CertificationItem,
  EducationItem,
  PageMargins,
  ProfileImage,
  ResumeData,
  ResumeLayout,
  SectionKey,
  TechnicalSkillGroup,
  WorkExperienceItem,
  ProjectItem,
} from '../types';

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'workExperience',
  'technicalSkills',
  'education',
  'projects',
  'certifications',
];

const DEFAULT_MARGINS: PageMargins = { top: 36, bottom: 36, left: 42, right: 42 };
const guestResumesByUserId = new Map<string, ResumeData[]>();

const isGuestUser = (userId: string) => userId.startsWith('guest-');

const emptyResume = (userId: string, title: string): ResumeData => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    userId,
    title,
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      website: '',
    },
    introduction: '',
    workExperiences: [],
    technicalSkills: [],
    education: [],
    projects: [],
    certifications: [],
    layout: 'classic',
    profileImage: null,
    pageSize: 'A4',
    pageMargins: DEFAULT_MARGINS,
    fontSize: 9.8,
    lineHeight: 1.35,
    sectionOrder: DEFAULT_SECTION_ORDER,
    hiddenSections: [],
    createdAt: now,
    updatedAt: now,
  };
};

const asArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

const mapRowToResume = (row: any): ResumeData => ({
  id: row.id,
  userId: row.user_id,
  title: row.title || 'Untitled Resume',
  personalInfo: {
    fullName: row.personal_info?.fullName || '',
    email: row.personal_info?.email || '',
    phone: row.personal_info?.phone || '',
    website: row.personal_info?.website || '',
  },
  introduction: row.introduction || '',
  workExperiences: asArray<WorkExperienceItem>(row.work_experiences),
  technicalSkills: asArray<TechnicalSkillGroup>(row.technical_skills),
  education: asArray<EducationItem>(row.education),
  projects: asArray<ProjectItem>(row.projects),
  certifications: asArray<CertificationItem>(row.certifications),
  layout: (row.layout || 'classic') as ResumeLayout,
  profileImage: (row.profile_image || null) as ProfileImage | null,
  pageSize: row.page_size || 'A4',
  pageMargins: row.page_margins || DEFAULT_MARGINS,
  fontSize: Number(row.font_size || 9.8),
  lineHeight: Number(row.line_height || 1.35),
  sectionOrder: asArray<SectionKey>(row.section_order).length > 0
    ? asArray<SectionKey>(row.section_order)
    : DEFAULT_SECTION_ORDER,
  hiddenSections: asArray<SectionKey>(row.hidden_sections),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapResumeToRow = (resume: ResumeData, updatedAt: string) => ({
  id: resume.id,
  user_id: resume.userId,
  title: resume.title,
  personal_info: resume.personalInfo,
  introduction: resume.introduction,
  work_experiences: resume.workExperiences,
  technical_skills: resume.technicalSkills,
  education: resume.education,
  projects: resume.projects,
  certifications: resume.certifications,
  layout: resume.layout || 'classic',
  profile_image: resume.profileImage || null,
  page_size: resume.pageSize,
  page_margins: resume.pageMargins || DEFAULT_MARGINS,
  font_size: resume.fontSize || 9.8,
  line_height: resume.lineHeight || 1.35,
  section_order: resume.sectionOrder || DEFAULT_SECTION_ORDER,
  hidden_sections: resume.hiddenSections || [],
  created_at: resume.createdAt,
  updated_at: updatedAt,
});

const getGuestResumes = (userId: string) => guestResumesByUserId.get(userId) || [];

const saveGuestResumes = (userId: string, resumes: ResumeData[]) => {
  guestResumesByUserId.set(userId, resumes);
};

export const resumeService = {
  async getResumes(userId: string): Promise<ResumeData[]> {
    if (isGuestUser(userId)) {
      return getGuestResumes(userId);
    }

    if (!isSupabaseConfigured) {
      console.error('Supabase is not configured. Resume persistence is unavailable for accounts.');
      return [];
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }

    return (data || []).map(mapRowToResume);
  },

  async getResumeById(resumeId: string, userId: string): Promise<ResumeData | null> {
    if (isGuestUser(userId)) {
      return getGuestResumes(userId).find((resume) => resume.id === resumeId) || null;
    }

    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching resume:', error);
      return null;
    }

    return data ? mapRowToResume(data) : null;
  },

  async createResume(userId: string, title: string): Promise<ResumeData> {
    const resume = emptyResume(userId, title);

    if (isGuestUser(userId)) {
      saveGuestResumes(userId, [resume, ...getGuestResumes(userId)]);
      return resume;
    }

    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Add environment variables before creating account resumes.');
    }

    const { error } = await supabase
      .from('resumes')
      .insert(mapResumeToRow(resume, resume.updatedAt));

    if (error) {
      throw new Error(error.message);
    }

    return resume;
  },

  async saveResume(resume: ResumeData): Promise<{ success: boolean; error?: string }> {
    const updatedAt = new Date().toISOString();
    const updatedResume = { ...resume, updatedAt };

    if (isGuestUser(resume.userId)) {
      const resumes = getGuestResumes(resume.userId);
      const existingIndex = resumes.findIndex((item) => item.id === resume.id);
      const next = existingIndex >= 0
        ? resumes.map((item) => item.id === resume.id ? updatedResume : item)
        : [updatedResume, ...resumes];
      saveGuestResumes(resume.userId, next);
      return { success: true };
    }

    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const { error } = await supabase
      .from('resumes')
      .upsert(mapResumeToRow(updatedResume, updatedAt));

    if (error) {
      console.error('Supabase save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async deleteResume(resumeId: string, userId: string): Promise<boolean> {
    if (isGuestUser(userId)) {
      saveGuestResumes(userId, getGuestResumes(userId).filter((item) => item.id !== resumeId));
      return true;
    }

    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting resume:', error);
      return false;
    }

    return true;
  },

  async duplicateResume(resumeId: string, userId: string): Promise<ResumeData | null> {
    const original = await this.getResumeById(resumeId, userId);
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicated: ResumeData = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      workExperiences: original.workExperiences.map((item) => ({ ...item, id: crypto.randomUUID() })),
      technicalSkills: original.technicalSkills.map((item) => ({ ...item, id: crypto.randomUUID() })),
      education: original.education.map((item) => ({ ...item, id: crypto.randomUUID() })),
      projects: original.projects.map((item) => ({ ...item, id: crypto.randomUUID() })),
      certifications: original.certifications.map((item) => ({ ...item, id: crypto.randomUUID() })),
    };

    const result = await this.saveResume(duplicated);
    return result.success ? duplicated : null;
  },
};
