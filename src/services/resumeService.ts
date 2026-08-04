import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ResumeData, SectionKey } from '../types';
import { SAMPLE_RESUME } from '../data/sampleData';

const LOCAL_RESUMES_KEY = 'ats_builder_local_resumes';

function getLocalResumes(): ResumeData[] {
  try {
    const raw = localStorage.getItem(LOCAL_RESUMES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalResumes(resumes: ResumeData[]): void {
  localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(resumes));
}

export const resumeService = {
  async getResumes(userId: string): Promise<ResumeData[]> {
    if (isSupabaseConfigured && userId && !userId.startsWith('demo-user-')) {
      try {
        const { data: resumes, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error || !resumes) return getLocalResumes();

        // Fetch children for each resume
        const fullResumes = await Promise.all(
          resumes.map(async (r) => {
            return await resumeService.getResumeById(r.id, userId);
          })
        );

        return fullResumes.filter((r): r is ResumeData => r !== null);
      } catch (e) {
        console.error('Error fetching resumes from Supabase:', e);
        return getLocalResumes();
      }
    } else {
      const all = getLocalResumes();
      return all.filter((r) => r.userId === userId || !r.userId || userId.startsWith('demo-user-'));
    }
  },

  async getResumeById(resumeId: string, userId: string): Promise<ResumeData | null> {
    if (isSupabaseConfigured && userId && !userId.startsWith('demo-user-')) {
      try {
        const { data: r, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .single();

        if (error || !r) {
          const local = getLocalResumes().find((item) => item.id === resumeId);
          return local || null;
        }

        // Fetch work exps + descriptions
        const { data: workExps } = await supabase
          .from('work_experiences')
          .select('*')
          .eq('resume_id', resumeId)
          .order('sort_order', { ascending: true });

        const fullWorkExps = await Promise.all(
          (workExps || []).map(async (w) => {
            const { data: descs } = await supabase
              .from('work_experience_descriptions')
              .select('description')
              .eq('work_experience_id', w.id)
              .order('sort_order', { ascending: true });

            return {
              id: w.id,
              jobTitle: w.job_title || '',
              company: w.company || '',
              duration: w.duration || '',
              descriptions: (descs || []).map((d) => d.description),
              sortOrder: w.sort_order || 0,
            };
          })
        );

        // Fetch technical skills
        const { data: skills } = await supabase
          .from('technical_skill_groups')
          .select('*')
          .eq('resume_id', resumeId)
          .order('sort_order', { ascending: true });

        // Fetch education
        const { data: edu } = await supabase
          .from('education_entries')
          .select('*')
          .eq('resume_id', resumeId)
          .order('sort_order', { ascending: true });

        // Fetch projects + descriptions
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('resume_id', resumeId)
          .order('sort_order', { ascending: true });

        const fullProjects = await Promise.all(
          (projects || []).map(async (p) => {
            const { data: descs } = await supabase
              .from('project_descriptions')
              .select('description')
              .eq('project_id', p.id)
              .order('sort_order', { ascending: true });

            return {
              id: p.id,
              projectTitle: p.project_title || '',
              descriptions: (descs || []).map((d) => d.description),
              sortOrder: p.sort_order || 0,
            };
          })
        );

        // Fetch certifications
        const { data: certs } = await supabase
          .from('certifications')
          .select('*')
          .eq('resume_id', resumeId)
          .order('sort_order', { ascending: true });

        const resumeData: ResumeData = {
          id: r.id,
          userId: r.user_id,
          title: r.title || 'Untitled Resume',
          pageSize: r.page_size || 'A4',
          pageMargins: r.page_margins || { top: 36, bottom: 36, left: 42, right: 42 },
          personalInfo: {
            fullName: r.full_name || '',
            email: r.email || '',
            phone: r.phone || '',
            website: r.website || '',
          },
          introduction: r.introduction || '',
          sectionOrder: r.section_order || [
            'workExperience',
            'technicalSkills',
            'education',
            'projects',
            'certifications',
          ],
          hiddenSections: r.hidden_sections || [],
          workExperiences: fullWorkExps,
          technicalSkills: (skills || []).map((s) => ({
            id: s.id,
            title: s.title || '',
            skills: s.skills || '',
            sortOrder: s.sort_order || 0,
          })),
          education: (edu || []).map((e) => ({
            id: e.id,
            program: e.program || '',
            school: e.school || '',
            year: e.year || '',
            sortOrder: e.sort_order || 0,
          })),
          projects: fullProjects,
          certifications: (certs || []).map((c) => ({
            id: c.id,
            giver: c.giver || '',
            title: c.title || '',
            sortOrder: c.sort_order || 0,
          })),
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };

        return resumeData;
      } catch (e) {
        console.error('Error fetching resume by id:', e);
        const local = getLocalResumes().find((item) => item.id === resumeId);
        return local || null;
      }
    } else {
      const local = getLocalResumes().find((item) => item.id === resumeId);
      return local || null;
    }
  },

  async createResume(userId: string, title: string, loadSample = false): Promise<ResumeData> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    let initial = loadSample
      ? { ...SAMPLE_RESUME, title }
      : {
          title,
          pageSize: 'A4' as const,
          pageMargins: { top: 36, bottom: 36, left: 42, right: 42 },
          sectionOrder: [
            'workExperience',
            'technicalSkills',
            'education',
            'projects',
            'certifications',
          ] as SectionKey[],
          hiddenSections: [] as SectionKey[],
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
        };

    const newResume: ResumeData = {
      ...initial,
      id: newId,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured && userId && !userId.startsWith('demo-user-')) {
      try {
        await supabase.from('resumes').insert({
          id: newId,
          user_id: userId,
          title: newResume.title,
          full_name: newResume.personalInfo.fullName,
          email: newResume.personalInfo.email,
          phone: newResume.personalInfo.phone,
          website: newResume.personalInfo.website,
          introduction: newResume.introduction,
          page_size: newResume.pageSize,
          section_order: newResume.sectionOrder,
          hidden_sections: newResume.hiddenSections,
          created_at: now,
          updated_at: now,
        });

        await this.saveResume(newResume);
      } catch (e) {
        console.error('Error creating resume in Supabase:', e);
      }
    }

    // Always mirror to local storage
    const all = getLocalResumes();
    all.unshift(newResume);
    saveLocalResumes(all);

    return newResume;
  },

  async saveResume(resume: ResumeData): Promise<{ success: boolean; error?: string }> {
    const updatedAt = new Date().toISOString();
    const updatedResume = { ...resume, updatedAt };

    // Update local storage immediately for fast UI feedback & offline safety
    const allLocal = getLocalResumes();
    const idx = allLocal.findIndex((item) => item.id === resume.id);
    if (idx >= 0) {
      allLocal[idx] = updatedResume;
    } else {
      allLocal.unshift(updatedResume);
    }
    saveLocalResumes(allLocal);

    if (isSupabaseConfigured && resume.userId && !resume.userId.startsWith('demo-user-')) {
      try {
        // 1. Upsert base resume
        const { error: resumeError } = await supabase.from('resumes').upsert({
          id: resume.id,
          user_id: resume.userId,
          title: resume.title,
          full_name: resume.personalInfo.fullName,
          email: resume.personalInfo.email,
          phone: resume.personalInfo.phone,
          website: resume.personalInfo.website,
          introduction: resume.introduction,
          page_size: resume.pageSize,
          section_order: resume.sectionOrder,
          hidden_sections: resume.hiddenSections,
          updated_at: updatedAt,
        });

        if (resumeError) {
          console.error('Supabase save error:', resumeError);
          return { success: false, error: resumeError.message };
        }

        // 2. Sync work experiences
        await supabase.from('work_experiences').delete().eq('resume_id', resume.id);
        for (let i = 0; i < resume.workExperiences.length; i++) {
          const w = resume.workExperiences[i];
          const wId = w.id && w.id.length > 20 ? w.id : crypto.randomUUID();
          await supabase.from('work_experiences').insert({
            id: wId,
            resume_id: resume.id,
            job_title: w.jobTitle,
            company: w.company,
            duration: w.duration,
            sort_order: i,
            updated_at: updatedAt,
          });

          // Insert descriptions
          if (w.descriptions && w.descriptions.length > 0) {
            const descRows = w.descriptions.map((desc, dIdx) => ({
              id: crypto.randomUUID(),
              work_experience_id: wId,
              description: desc,
              sort_order: dIdx,
              updated_at: updatedAt,
            }));
            await supabase.from('work_experience_descriptions').insert(descRows);
          }
        }

        // 3. Sync technical skill groups
        await supabase.from('technical_skill_groups').delete().eq('resume_id', resume.id);
        if (resume.technicalSkills.length > 0) {
          const skillRows = resume.technicalSkills.map((s, sIdx) => ({
            id: s.id && s.id.length > 20 ? s.id : crypto.randomUUID(),
            resume_id: resume.id,
            title: s.title,
            skills: s.skills,
            sort_order: sIdx,
            updated_at: updatedAt,
          }));
          await supabase.from('technical_skill_groups').insert(skillRows);
        }

        // 4. Sync education
        await supabase.from('education_entries').delete().eq('resume_id', resume.id);
        if (resume.education.length > 0) {
          const eduRows = resume.education.map((e, eIdx) => ({
            id: e.id && e.id.length > 20 ? e.id : crypto.randomUUID(),
            resume_id: resume.id,
            program: e.program,
            school: e.school,
            year: e.year,
            sort_order: eIdx,
            updated_at: updatedAt,
          }));
          await supabase.from('education_entries').insert(eduRows);
        }

        // 5. Sync projects
        await supabase.from('projects').delete().eq('resume_id', resume.id);
        for (let i = 0; i < resume.projects.length; i++) {
          const p = resume.projects[i];
          const pId = p.id && p.id.length > 20 ? p.id : crypto.randomUUID();
          await supabase.from('projects').insert({
            id: pId,
            resume_id: resume.id,
            project_title: p.projectTitle,
            sort_order: i,
            updated_at: updatedAt,
          });

          if (p.descriptions && p.descriptions.length > 0) {
            const descRows = p.descriptions.map((desc, dIdx) => ({
              id: crypto.randomUUID(),
              project_id: pId,
              description: desc,
              sort_order: dIdx,
              updated_at: updatedAt,
            }));
            await supabase.from('project_descriptions').insert(descRows);
          }
        }

        // 6. Sync certifications
        await supabase.from('certifications').delete().eq('resume_id', resume.id);
        if (resume.certifications.length > 0) {
          const certRows = resume.certifications.map((c, cIdx) => ({
            id: c.id && c.id.length > 20 ? c.id : crypto.randomUUID(),
            resume_id: resume.id,
            giver: c.giver,
            title: c.title,
            sort_order: cIdx,
            updated_at: updatedAt,
          }));
          await supabase.from('certifications').insert(certRows);
        }

        return { success: true };
      } catch (e: any) {
        console.error('Error saving to Supabase:', e);
        return { success: false, error: e?.message || 'Failed to save to cloud' };
      }
    }

    return { success: true };
  },

  async deleteResume(resumeId: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && userId && !userId.startsWith('demo-user-')) {
      try {
        await supabase.from('resumes').delete().eq('id', resumeId);
      } catch (e) {
        console.error('Error deleting from Supabase:', e);
      }
    }
    const all = getLocalResumes().filter((item) => item.id !== resumeId);
    saveLocalResumes(all);
    return true;
  },

  async duplicateResume(resumeId: string, userId: string): Promise<ResumeData | null> {
    const original = await this.getResumeById(resumeId, userId);
    if (!original) return null;

    const newTitle = `${original.title} (Copy)`;
    const copy = await this.createResume(userId, newTitle, false);

    const duplicatedData: ResumeData = {
      ...original,
      id: copy.id,
      title: newTitle,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
      // regenerate inner child IDs
      workExperiences: original.workExperiences.map((w) => ({
        ...w,
        id: crypto.randomUUID(),
      })),
      technicalSkills: original.technicalSkills.map((s) => ({
        ...s,
        id: crypto.randomUUID(),
      })),
      education: original.education.map((e) => ({
        ...e,
        id: crypto.randomUUID(),
      })),
      projects: original.projects.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
      })),
      certifications: original.certifications.map((c) => ({
        ...c,
        id: crypto.randomUUID(),
      })),
    };

    await this.saveResume(duplicatedData);
    return duplicatedData;
  }
};
