import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image as PdfImage,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer';
import { ResumeData, SectionKey, PageMargins } from '../../types';

// Register standard ATS-safe Helvetica font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/standard_fonts/Helvetica.afm' },
    { src: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/standard_fonts/Helvetica-Bold.afm', fontWeight: 'bold' },
  ],
});

const createPdfStyles = (
  margins: PageMargins = { top: 36, bottom: 36, left: 42, right: 42 },
  baseFontSize: number = 9.8,
  baseLineHeight: number = 1.35
) =>
  StyleSheet.create({
    page: {
      paddingTop: margins.top,
      paddingBottom: margins.bottom,
      paddingLeft: margins.left,
      paddingRight: margins.right,
      fontFamily: 'Helvetica',
      fontSize: baseFontSize,
      lineHeight: baseLineHeight,
      color: '#111111',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    name: {
      fontSize: Math.round(baseFontSize * 2.04 * 10) / 10,
      lineHeight: 1.2,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 4,
      color: '#000000',
      textAlign: 'center',
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    contactItem: {
      fontSize: Math.round(baseFontSize * 0.97 * 10) / 10,
      lineHeight: 1.25,
      fontWeight: 'bold',
      color: '#111111',
      textDecoration: 'none',
    },
    separator: {
      marginHorizontal: 5,
      color: '#666666',
      fontSize: Math.round(baseFontSize * 0.97 * 10) / 10,
      lineHeight: 1.25,
    },
    introduction: {
      fontSize: baseFontSize,
      lineHeight: baseLineHeight,
      textAlign: 'center',
      color: '#222222',
      marginTop: 4,
      paddingHorizontal: 8,
    },
    photoHeaderContainer: {
      marginBottom: 12,
    },
    photoHeaderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 7,
      paddingRight: 2,
    },
    photoHeaderContent: {
      flex: 1,
      minHeight: 84,
      paddingRight: 14,
      justifyContent: 'center',
    },
    photoName: {
      fontSize: Math.round(baseFontSize * 2.04 * 10) / 10,
      lineHeight: 1.15,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 5,
      color: '#000000',
      textAlign: 'left',
    },
    photoContactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    photoContactItem: {
      fontSize: Math.round(baseFontSize * 0.97 * 10) / 10,
      lineHeight: 1.25,
      fontWeight: 'bold',
      color: '#111111',
      textDecoration: 'none',
    },
    photoIntroduction: {
      fontSize: baseFontSize,
      lineHeight: baseLineHeight,
      textAlign: 'left',
      color: '#222222',
      marginTop: 2,
      paddingTop: 7,
      borderTopWidth: 1,
      borderTopColor: '#222222',
    },
    photoFrame: {
      width: 84,
      height: 84,
      borderWidth: 1,
      borderColor: '#222222',
      backgroundColor: '#ffffff',
      marginLeft: 18,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    profileImage: {
      width: 80,
      height: 80,
      objectFit: 'cover',
    },
    photoPlaceholder: {
      width: 80,
      height: 80,
      backgroundColor: '#f1f5f9',
    },
    section: {
      marginTop: 12,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: Math.round(baseFontSize * 1.22 * 10) / 10,
      lineHeight: 1.2,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#000000',
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    dividerLine: {
      borderBottomWidth: 1,
      borderBottomColor: '#222222',
      marginBottom: 8,
    },
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 1,
    },
    titleBold: {
      fontSize: Math.round(baseFontSize * 1.07 * 10) / 10,
      lineHeight: 1.2,
      fontWeight: 'bold',
      color: '#000000',
      flex: 1,
      paddingRight: 8,
    },
    projectTitleBold: {
      fontSize: Math.round(baseFontSize * 1.07 * 10) / 10,
      lineHeight: 1.2,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 2,
    },
    dateBold: {
      fontSize: baseFontSize,
      lineHeight: 1.2,
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'right',
    },
    subLine: {
      fontSize: baseFontSize,
      lineHeight: 1.25,
      color: '#333333',
      marginBottom: 3,
    },
    bulletRow: {
      flexDirection: 'row',
      marginBottom: 2.5,
      paddingLeft: 4,
    },
    bulletPoint: {
      width: 12,
      fontSize: baseFontSize,
      color: '#111111',
    },
    bulletContent: {
      flex: 1,
      fontSize: baseFontSize,
      color: '#222222',
      lineHeight: baseLineHeight,
    },
    skillRow: {
      flexDirection: 'row',
      marginBottom: 3,
      paddingLeft: 4,
    },
    skillCategoryBold: {
      fontWeight: 'bold',
      fontSize: baseFontSize,
      color: '#000000',
    },
    skillText: {
      fontSize: baseFontSize,
      color: '#222222',
      flex: 1,
      lineHeight: baseLineHeight,
    },
    certRow: {
      flexDirection: 'row',
      marginBottom: 3,
      paddingLeft: 4,
    },
    certGiverBold: {
      fontWeight: 'bold',
      fontSize: baseFontSize,
      color: '#000000',
    },
  });

interface Props {
  data: ResumeData;
}

export const ResumePdfDocument: React.FC<Props> = ({ data }) => {
  const {
    personalInfo,
    introduction,
    workExperiences,
    technicalSkills,
    education,
    projects,
    certifications,
    layout = 'classic',
    profileImage,
    pageSize = 'A4',
    pageMargins = { top: 36, bottom: 36, left: 42, right: 42 },
    fontSize = 9.8,
    lineHeight = 1.35,
    sectionOrder = [
      'workExperience',
      'technicalSkills',
      'education',
      'projects',
      'certifications',
    ],
    hiddenSections = [],
  } = data;

  const styles = createPdfStyles(pageMargins, fontSize, lineHeight);

  // Render contact line with vertical separators
  const contactParts: { label: string; isLink?: boolean; href?: string }[] = [];
  if (personalInfo.email?.trim()) {
    contactParts.push({
      label: personalInfo.email.trim(),
      isLink: true,
      href: `mailto:${personalInfo.email.trim()}`,
    });
  }
  if (personalInfo.phone?.trim()) {
    contactParts.push({
      label: personalInfo.phone.trim(),
      isLink: true,
      href: `tel:${personalInfo.phone.trim().replace(/\s+/g, '')}`,
    });
  }
  if (personalInfo.website?.trim()) {
    const rawUrl = personalInfo.website.trim();
    const formattedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const cleanDisplay = rawUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    contactParts.push({
      label: cleanDisplay,
      isLink: true,
      href: formattedUrl,
    });
  }

  const renderSection = (key: SectionKey) => {
    if (hiddenSections.includes(key)) return null;

    switch (key) {
      case 'workExperience':
        if (!workExperiences || workExperiences.length === 0) return null;
        return (
          <View key="workExperience" style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={25}>WORK EXPERIENCE</Text>
            <View style={styles.dividerLine} />
            {workExperiences.map((exp, idx) => (
              <View key={exp.id || idx} style={{ marginBottom: idx === workExperiences.length - 1 ? 0 : 10 }} wrap={false}>
                <View style={styles.rowHeader}>
                  <Text style={styles.titleBold}>{exp.jobTitle}</Text>
                  <Text style={styles.dateBold}>{exp.duration}</Text>
                </View>
                {exp.company ? <Text style={styles.subLine}>{exp.company}</Text> : null}
                {exp.descriptions?.map((desc, dIdx) => (
                  desc.trim() ? (
                    <View key={dIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletContent}>{desc.trim()}</Text>
                    </View>
                  ) : null
                ))}
              </View>
            ))}
          </View>
        );

      case 'technicalSkills':
        if (!technicalSkills || technicalSkills.length === 0) return null;
        return (
          <View key="technicalSkills" style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={25}>TECHNICAL SKILLS</Text>
            <View style={styles.dividerLine} />
            {technicalSkills.map((cat, idx) => (
              cat.skills?.trim() ? (
                <View key={cat.id || idx} style={styles.skillRow} wrap={false}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.skillText}>
                    <Text style={styles.skillCategoryBold}>{cat.title ? `${cat.title.trim()}: ` : ''}</Text>
                    {cat.skills}
                  </Text>
                </View>
              ) : null
            ))}
          </View>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <View key="education" style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={25}>EDUCATION</Text>
            <View style={styles.dividerLine} />
            {education.map((edu, idx) => (
              <View key={edu.id || idx} style={{ marginBottom: idx === education.length - 1 ? 0 : 8 }} wrap={false}>
                <View style={styles.rowHeader}>
                  <Text style={styles.titleBold}>{edu.program}</Text>
                  <Text style={styles.dateBold}>{edu.year}</Text>
                </View>
                {edu.school ? <Text style={styles.subLine}>{edu.school}</Text> : null}
              </View>
            ))}
          </View>
        );

      case 'projects':
        if (!projects || projects.length === 0) return null;
        return (
          <View key="projects" style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={25}>PROJECTS</Text>
            <View style={styles.dividerLine} />
            {projects.map((proj, idx) => (
              <View key={proj.id || idx} style={{ marginBottom: idx === projects.length - 1 ? 0 : 8 }} wrap={false}>
                <Text style={styles.projectTitleBold}>{proj.projectTitle}</Text>
                {proj.descriptions?.map((desc, dIdx) => (
                  desc.trim() ? (
                    <View key={dIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletContent}>{desc.trim()}</Text>
                    </View>
                  ) : null
                ))}
              </View>
            ))}
          </View>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <View key="certifications" style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={25}>CERTIFICATIONS</Text>
            <View style={styles.dividerLine} />
            {certifications.map((cert, idx) => (
              <View key={cert.id || idx} style={styles.certRow} wrap={false}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.skillText}>
                  {cert.giver?.trim() ? (
                    <Text style={styles.certGiverBold}>{cert.giver.trim()}: </Text>
                  ) : null}
                  {cert.title}
                </Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  const dynamicPageStyle = [
    styles.page,
    {
      paddingTop: pageMargins?.top ?? 36,
      paddingBottom: pageMargins?.bottom ?? 36,
      paddingLeft: pageMargins?.left ?? 42,
      paddingRight: pageMargins?.right ?? 42,
    },
  ];

  const renderClassicHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.name}>{personalInfo.fullName || 'YOUR NAME'}</Text>

      {contactParts.length > 0 && (
        <View style={styles.contactRow}>
          {contactParts.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Text style={styles.separator}>|</Text>}
              {item.isLink && item.href ? (
                <Link src={item.href} style={[styles.contactItem, { textDecoration: 'none' }]}>
                  {item.label}
                </Link>
              ) : (
                <Text style={styles.contactItem}>{item.label}</Text>
              )}
            </React.Fragment>
          ))}
        </View>
      )}

      {introduction?.trim() ? (
        <Text style={styles.introduction}>{introduction.trim()}</Text>
      ) : null}
    </View>
  );

  const renderPhotoHeader = () => (
    <View style={styles.photoHeaderContainer}>
      <View style={styles.photoHeaderTop}>
        <View style={styles.photoHeaderContent}>
          <Text style={styles.photoName}>{personalInfo.fullName || 'YOUR NAME'}</Text>

          {contactParts.length > 0 && (
            <View style={styles.photoContactRow}>
              {contactParts.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Text style={styles.separator}>|</Text>}
                  {item.isLink && item.href ? (
                    <Link src={item.href} style={[styles.photoContactItem, { textDecoration: 'none' }]}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text style={styles.photoContactItem}>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        <View style={styles.photoFrame}>
          {profileImage?.croppedDataUrl ? (
            <PdfImage src={profileImage.croppedDataUrl} style={styles.profileImage} />
          ) : (
            <View style={styles.photoPlaceholder} />
          )}
        </View>
      </View>

      {introduction?.trim() ? (
        <Text style={styles.photoIntroduction}>{introduction.trim()}</Text>
      ) : null}
    </View>
  );

  return (
    <Document title={`${personalInfo.fullName || 'Resume'} - ATS Resume`}>
      <Page size={pageSize === 'LETTER' ? 'LETTER' : 'A4'} style={dynamicPageStyle}>
        {/* HEADER */}
        {layout === 'photo' ? renderPhotoHeader() : renderClassicHeader()}

        {/* SECTIONS IN USER SPECIFIED ORDER */}
        {sectionOrder.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
};
