import { ResumeData } from '../types';

export const SAMPLE_RESUME: Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  title: 'DevOps & Cloud Engineer Resume',
  pageSize: 'A4',
  pageMargins: { top: 36, bottom: 36, left: 42, right: 42 },
  sectionOrder: [
    'workExperience',
    'technicalSkills',
    'education',
    'projects',
    'certifications'
  ],
  hiddenSections: [],
  personalInfo: {
    fullName: 'ORVEN CASIDO',
    email: 'orvencasidop@gmail.com',
    phone: '+63 912 345 6789',
    website: 'https://github.com/orvencasido',
  },
  introduction:
    'Results-driven DevOps and Software Engineer with over 4 years of experience specializing in cloud infrastructure, automated CI/CD pipelines, container orchestration, and full-stack web applications. Proven track record of reducing deployment overhead by 50% and improving system reliability to 99.99% through infrastructure-as-code and pro-active monitoring.',
  workExperiences: [
    {
      id: 'work-1',
      jobTitle: 'Senior Cloud & DevOps Engineer',
      company: 'TechSolutions Inc.',
      duration: 'January 2024 - Present',
      sortOrder: 1,
      descriptions: [
        'Architected and deployed multi-region Kubernetes (EKS/GKE) clusters hosting high-throughput microservices, achieving 99.99% operational uptime.',
        'Engineered automated CI/CD pipelines using GitHub Actions and Terraform, reducing release cycle lead times from 3 days to under 20 minutes.',
        'Implemented centralized monitoring and alert metrics with Prometheus, Grafana, and Datadog, cutting incident response MTTR by 45%.',
        'Enforced strict security scanning (Trivy, SonarQube) in build pipelines, preventing 100+ high-severity vulnerabilities prior to production release.'
      ]
    },
    {
      id: 'work-2',
      jobTitle: 'Software & Infrastructure Developer',
      company: 'Nexus Digital Systems',
      duration: 'June 2021 - December 2023',
      sortOrder: 2,
      descriptions: [
        'Developed microservices using Node.js, TypeScript, and Go, handling over 2 million daily API transactions.',
        'Migrated legacy monolithic applications to Docker containers on AWS ECS with zero downtime during peak business hours.',
        'Configured PostgreSQL database read-replicas and Redis caching layers, improving API response speed by 60%.'
      ]
    }
  ],
  technicalSkills: [
    {
      id: 'skill-1',
      title: 'Cloud & Infrastructure',
      skills: 'Kubernetes, Docker, AWS (EC2, S3, ECS, EKS), Google Cloud Platform, Azure, Terraform, Ansible',
      sortOrder: 1
    },
    {
      id: 'skill-2',
      title: 'CI/CD & DevOps',
      skills: 'GitHub Actions, GitLab CI, Jenkins, ArgoCD, Helm, Prometheus, Grafana, Datadog',
      sortOrder: 2
    },
    {
      id: 'skill-3',
      title: 'Programming & Web',
      skills: 'TypeScript, JavaScript, Node.js, Go, Python, React, HTML5/CSS3, Express.js, REST APIs',
      sortOrder: 3
    },
    {
      id: 'skill-4',
      title: 'Databases & Tools',
      skills: 'PostgreSQL, Supabase, Redis, MongoDB, Git, Linux (Debian, Ubuntu), Bash Scripting',
      sortOrder: 4
    }
  ],
  education: [
    {
      id: 'edu-1',
      program: 'Bachelor of Science in Computer Engineering',
      school: 'Southern Luzon State University',
      year: 'September 2017 - July 2021',
      sortOrder: 1
    }
  ],
  projects: [
    {
      id: 'proj-1',
      projectTitle: 'Automated Infrastructure Provisioner CLI',
      sortOrder: 1,
      descriptions: [
        'Built a custom Go CLI utility that scaffolds production-ready Terraform modules for AWS and GCP environments in seconds.',
        'Integrated automated unit testing for IaC code using Terratest, reducing syntax deployment errors to zero.'
      ]
    },
    {
      id: 'proj-2',
      projectTitle: 'Real-Time Server Telemetry Dashboard',
      sortOrder: 2,
      descriptions: [
        'Created a full-stack React and Node.js dashboard displaying live container CPU, memory, and network throughput via WebSockets.',
        'Utilized Supabase real-time subscriptions for immediate alert distribution to engineering teams.'
      ]
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      giver: 'Amazon Web Services',
      title: 'AWS Certified Solutions Architect – Associate',
      sortOrder: 1
    },
    {
      id: 'cert-2',
      giver: 'Cloud Native Computing Foundation',
      title: 'Certified Kubernetes Administrator (CKA)',
      sortOrder: 2
    }
  ]
};
