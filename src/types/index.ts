export type PageSize = 'A4' | 'LETTER';

export type ResumeLayout = 'classic' | 'photo';

export type SectionKey = 
  | 'workExperience'
  | 'technicalSkills'
  | 'education'
  | 'projects'
  | 'certifications';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  website: string;
}

export interface ProfileImage {
  originalDataUrl: string;
  croppedDataUrl: string;
  zoom: number;
  positionX: number;
  positionY: number;
}

export interface WorkExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  duration: string;
  descriptions: string[];
  sortOrder: number;
}

export interface TechnicalSkillGroup {
  id: string;
  title: string;
  skills: string;
  sortOrder: number;
}

export interface EducationItem {
  id: string;
  program: string;
  school: string;
  year: string;
  sortOrder: number;
}

export interface ProjectItem {
  id: string;
  projectTitle: string;
  descriptions: string[];
  sortOrder: number;
}

export interface CertificationItem {
  id: string;
  giver: string;
  title: string;
  sortOrder: number;
}

export interface PageMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  introduction: string;
  workExperiences: WorkExperienceItem[];
  technicalSkills: TechnicalSkillGroup[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  layout?: ResumeLayout;
  profileImage?: ProfileImage | null;
  pageSize: PageSize;
  pageMargins?: PageMargins;
  fontSize?: number;
  lineHeight?: number;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface AtsCheckResult {
  status: 'Ready' | 'Needs Review' | 'Incomplete';
  score: number; // Percentage calculation for display
  warnings: string[];
  suggestions: string[];
  passes: string[];
}
