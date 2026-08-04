import { ResumeData, AtsCheckResult } from '../types';

export function checkAtsReadiness(resume: Partial<ResumeData>): AtsCheckResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const passes: string[] = [];

  let scorePoints = 0;
  const maxPoints = 10;

  // 1. Candidate Name
  if (!resume.personalInfo?.fullName?.trim()) {
    warnings.push('Candidate name is missing from Personal Information.');
  } else {
    scorePoints += 2;
    passes.push('Full candidate name is provided.');
  }

  // 2. Email Address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!resume.personalInfo?.email?.trim()) {
    warnings.push('Email address is missing.');
  } else if (!emailRegex.test(resume.personalInfo.email.trim())) {
    warnings.push('Email address format appears invalid.');
  } else {
    scorePoints += 2;
    passes.push('Valid email address included.');
  }

  // 3. Website / Portfolio URL
  if (resume.personalInfo?.website?.trim()) {
    const web = resume.personalInfo.website.trim();
    if (!web.startsWith('http://') && !web.startsWith('https://') && !web.includes('.')) {
      suggestions.push('Website URL should include domain extension or https:// prefix.');
    } else {
      passes.push('Website or portfolio URL included.');
    }
  }

  // 4. Professional Introduction
  const intro = resume.introduction?.trim() || '';
  if (!intro) {
    suggestions.push('Consider adding a concise Professional Introduction (40-100 words).');
  } else {
    const wordCount = intro.split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) {
      suggestions.push(`Professional Introduction is brief (${wordCount} words). Aim for 40–100 words.`);
      scorePoints += 1;
    } else if (wordCount > 120) {
      warnings.push(`Professional Introduction is long (${wordCount} words). Recommended length is 40–100 words.`);
      scorePoints += 1;
    } else {
      scorePoints += 2;
      passes.push(`Professional Introduction is optimal length (${wordCount} words).`);
    }
  }

  // 5. Work Experience
  const workExps = resume.workExperiences || [];
  if (workExps.length === 0) {
    warnings.push('No work experience entries added.');
  } else {
    scorePoints += 2;
    passes.push(`${workExps.length} work experience entries added.`);

    let hasBullets = false;
    let longBulletCount = 0;
    workExps.forEach((exp) => {
      if (exp.descriptions && exp.descriptions.some((d) => d.trim())) {
        hasBullets = true;
      }
      exp.descriptions?.forEach((desc) => {
        if (desc.length > 220) {
          longBulletCount++;
        }
      });
    });

    if (!hasBullets) {
      warnings.push('Work experience items do not contain achievement bullet points.');
    }
    if (longBulletCount > 0) {
      suggestions.push(`${longBulletCount} work experience bullet point(s) exceed 220 characters. Keep bullets concise for ATS parsers.`);
    }
  }

  // 6. Technical Skills
  const skills = resume.technicalSkills || [];
  if (skills.length === 0) {
    warnings.push('No technical skill groups added.');
  } else {
    scorePoints += 1;
    passes.push(`${skills.length} technical skill group(s) listed.`);
  }

  // 7. Education
  const edu = resume.education || [];
  if (edu.length === 0) {
    suggestions.push('No education entries added.');
  } else {
    scorePoints += 1;
    passes.push('Education details included.');
  }

  const calculatedScore = Math.min(100, Math.round((scorePoints / maxPoints) * 100));

  let status: 'Ready' | 'Needs Review' | 'Incomplete' = 'Ready';
  if (warnings.length > 0) {
    if (calculatedScore < 50 || !resume.personalInfo?.fullName?.trim() || !resume.personalInfo?.email?.trim()) {
      status = 'Incomplete';
    } else {
      status = 'Needs Review';
    }
  }

  return {
    status,
    score: calculatedScore,
    warnings,
    suggestions,
    passes,
  };
}
