import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skillCache = new Set<string>();

async function getOrCreateSkill(name: string) {
  const trimmed = name.trim();
  if (skillCache.has(trimmed)) return;
  
  await prisma.skill.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed }
  });
  
  skillCache.add(trimmed);
}

async function mapSkills(skillsStr: string) {
  const names = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  for (const name of names) {
    await getOrCreateSkill(name);
  }
  return {
    connect: names.map(name => ({ name }))
  };
}

async function main() {
  console.log('Clearing database...');
  
  await prisma.job.deleteMany();
  await prisma.collabMember.deleteMany();
  await prisma.collabRequest.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  console.log('Seeding users sequentially...');
  const usersData = [
    {
      email: 'arsh@oneshopai.com',
      username: 'arsh',
      name: 'Arsh',
      bio: 'Full-stack developer building AI tools.',
      skills: 'React,Node.js,PostgreSQL,Tailwind CSS',
      currentRole: 'founder',
      organization: 'OneShopAI',
      location: 'Bangalore, India'
    },
    {
      email: 'sam@oneshopai.com',
      username: 'sam',
      name: 'Sam',
      bio: 'UI/UX Designer. Love animations.',
      skills: 'Figma,Framer Motion,React,CSS',
      currentRole: 'employee',
      organization: 'Figma',
      location: 'San Francisco, CA'
    },
    {
      email: 'alex@oneshopai.com',
      username: 'alexrivera',
      name: 'Alex Rivera',
      bio: 'Data Scientist passionate about LLMs.',
      skills: 'Python,PyTorch,SQL,Machine Learning,NLP',
      currentRole: 'student',
      organization: 'Stanford University',
      location: 'Stanford, CA'
    },
    {
      email: 'jordan@oneshopai.com',
      username: 'jordanlee',
      name: 'Jordan Lee',
      bio: 'Backend Engineer scaling distributed systems.',
      skills: 'Go,Rust,Kubernetes,Docker,PostgreSQL',
      currentRole: 'employee',
      organization: 'Stripe',
      location: 'Seattle, WA'
    },
    {
      email: 'maya@oneshopai.com',
      username: 'mayachen',
      name: 'Maya Chen',
      bio: 'Mobile App Developer.',
      skills: 'React Native,Swift,Kotlin,TypeScript',
      currentRole: 'student',
      organization: 'UC Berkeley',
      location: 'Berkeley, CA'
    }
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        name: u.name,
        profile: {
          create: {
            bio: u.bio,
            currentRole: u.currentRole,
            organization: u.organization,
            location: u.location,
            skills: await mapSkills(u.skills)
          }
        }
      }
    });
    users.push(user);
  }

  const [u1, u2, u3, u4, u5] = users;

  console.log('Seeding opportunities...');
  const jobsData = [
    // Quick Apply (Real world fast track applications)
    {
      title: 'Frontend React Freelancer',
      organization: 'Braintrust',
      description: 'Looking for a frontend specialist to jump in and build a 5-page dashboard. Budget is pre-approved. Immediate start.',
      skills: 'React,Tailwind CSS,API Integration',
      location: 'Remote',
      compensation: '$60 - $80 / hr',
      type: 'Startup Program'
    },
    {
      title: 'Technical Writer (Contract)',
      organization: 'Supabase',
      description: 'Help us write clear, concise documentation for our new Vector database features. We review applications within 24 hours.',
      skills: 'Technical Writing,PostgreSQL,Markdown',
      location: 'Remote, Global',
      compensation: '$50 / hr',
      type: 'Fellowships'
    },
    {
      title: 'UI Design Contractor for Landing Page',
      organization: 'Vercel',
      description: 'We need a high-impact landing page design for our upcoming conference. Quick turnaround required.',
      skills: 'Figma,Web Design,Branding',
      location: 'Remote',
      compensation: '$4,000 Flat',
      type: 'Startup Program'
    },
    // Full-Time
    {
      title: 'Senior Frontend Engineer',
      organization: 'OneShopAI',
      description: 'Lead the development of our core web platform. Work heavily with React, TypeScript, and modern UI engineering.',
      skills: 'React,Web Performance,TypeScript',
      location: 'Remote, India',
      compensation: '₹28,00,000 - ₹38,00,000 / yr',
      type: 'Full Time'
    },
    {
      title: 'AI Systems Researcher (Generative AI)',
      organization: 'OpenAI',
      description: 'Join the reasoning team to build the next generation of multimodal and generative agent architectures.',
      skills: 'Computer Science,PyTorch,Large Language Models',
      location: 'San Francisco, CA',
      compensation: '$250,000 - $350,000 / yr',
      type: 'Full Time'
    },
    {
      title: 'Full Stack Product Engineer',
      organization: 'Stripe',
      description: 'Build financial tools that empower millions of internet businesses. Work with React, TypeScript, and distributed backend systems.',
      skills: 'React,TypeScript,API Design,Distributed Systems',
      location: 'Remote, Global',
      compensation: '$140,000 - $175,000 / yr',
      type: 'Full Time'
    },
    {
      title: 'Product Design Engineer',
      organization: 'Linear',
      description: 'Help craft modern project management software. Design, prototype, and build production web interactions with obsession for craft.',
      skills: 'Figma,CSS,React,TypeScript',
      location: 'San Francisco, CA / Remote',
      compensation: '$150,000 - $185,000 / yr',
      type: 'Full Time'
    },
    // Internships
    {
      title: 'AI Research & Reasoning Intern (Summer 2026)',
      organization: 'Google DeepMind',
      description: 'Work alongside world-class scientists investigating agentic memory, test-time compute, and algorithmic reasoning benchmarks.',
      skills: 'Machine Learning,PyTorch,Deep Learning',
      location: 'London, UK / New York, NY',
      compensation: '$58 / hr + Housing Stipend',
      type: 'Internship'
    },
    {
      title: 'Frontend Engineering Intern',
      organization: 'Figma',
      description: 'Work on Figma web infrastructure, canvas rendering performance, or collaboration features.',
      skills: 'JavaScript,TypeScript,WebGL,Canvas',
      location: 'San Francisco, CA (Hybrid)',
      compensation: '$52 / hr',
      type: 'Internship'
    },
    {
      title: 'Software Engineer Intern - Core Systems',
      organization: 'Anthropic',
      description: 'Help develop reliable infrastructure powering frontier AI models. Tackle distributed systems challenges and latency optimization.',
      skills: 'Python,Go,Rust,CS Fundamentals',
      location: 'San Francisco, CA',
      compensation: '$60 / hr + Benefits',
      type: 'Internship'
    },
    {
      title: 'Open Source Fellow & Intern',
      organization: 'Supabase',
      description: 'Build backend SDKs, database integrations, and developer toolkits. Contribute directly to our open-source repositories.',
      skills: 'PostgreSQL,TypeScript,Node.js',
      location: 'Remote',
      compensation: '$40 / hr',
      type: 'Fellowships'
    },
    // Hackathons
    {
      title: 'AGI House Hackathon: Agents & Reasoning',
      organization: 'AGI House',
      description: 'Build the next generation of autonomous AI assistants and workflow automations. Direct investor pitch sessions for finalists.',
      skills: 'AI Agents,LLM APIs,Open Source',
      location: 'Hillsborough, CA',
      compensation: '$50,000 Prize Pool',
      type: 'Hackathon'
    },
    {
      title: 'HackMIT 2026 - Autonomous Web Sprint',
      organization: 'MIT',
      description: '36-hour sprint where top builders worldwide come together to prototype intelligent systems and creative tools.',
      skills: 'Prototyping,Full Stack Development',
      location: 'Cambridge, MA',
      compensation: '$30,000 Prizes',
      type: 'Hackathon'
    },
    {
      title: 'Solana Global AI x Web3 Hackathon',
      organization: 'Solana Foundation',
      description: 'Create high-throughput decentralized applications combining zero-knowledge proofs and AI compute verification.',
      skills: 'Rust,TypeScript,Smart Contracts,Web3',
      location: 'Virtual',
      compensation: '$100,000 Total Pool',
      type: 'Hackathon'
    },
    // Scholarships
    {
      title: 'Generation Google STEM Fellowship 2026',
      organization: 'Google',
      description: 'Awarded to aspiring computer scientists demonstrating strong academic achievement and passion for diversity in tech.',
      skills: 'Undergraduate,Computer Science,Leadership',
      location: 'North America & APAC',
      compensation: '$10,000 Merit Grant',
      type: 'Scholarship'
    },
    {
      title: 'Palantir Future Tech Builders Scholarship',
      organization: 'Palantir Technologies',
      description: 'Supports visionary undergraduate students who are pushing boundaries in critical software systems and ethical AI applications.',
      skills: 'STEM major,Data Engineering,Software Systems',
      location: 'United States & Canada',
      compensation: '$7,000 Grant + Summer Fast-track',
      type: 'Scholarship'
    },
    {
      title: 'OpenAI Scholar Program',
      organization: 'OpenAI',
      description: 'A 6-month full-time stipend program for individuals looking to transition into AI research from underrepresented backgrounds.',
      skills: 'Machine Learning,Python,Mathematics',
      location: 'San Francisco, CA',
      compensation: '$15,000 / mo Stipend',
      type: 'Fellowships'
    },
    {
      title: 'Y Combinator W27 Batch',
      organization: 'Y Combinator',
      description: 'Funding and mentorship for early-stage startups. Applications are open for the Winter 2027 batch.',
      skills: 'Founder,Startup,Product',
      location: 'San Francisco, CA',
      compensation: '$500,000 for 7%',
      type: 'Startup Program'
    },
    {
      title: 'Data Science Intern',
      organization: 'Netflix',
      description: 'Join the personalization team to improve the algorithms that recommend content to millions of users worldwide.',
      skills: 'Python,SQL,A/B Testing,Machine Learning',
      location: 'Los Gatos, CA',
      compensation: '$55 / hr + Housing',
      type: 'Internship'
    },
    {
      title: 'Rust Infrastructure Engineer',
      organization: 'Cloudflare',
      description: 'Build fast, memory-safe, and highly concurrent networking services that power the internet edge.',
      skills: 'Rust,Networking,Systems Engineering',
      location: 'Remote, US',
      compensation: '$160,000 - $210,000 / yr',
      type: 'Full Time'
    },
    {
      title: 'Global AI Summit Hackathon',
      organization: 'Anthropic & AWS',
      description: 'Build enterprise-grade AI tools using Claude 3.5 Sonnet and AWS infrastructure over a 48-hour sprint.',
      skills: 'AI Agents,AWS,Prompt Engineering',
      location: 'Virtual',
      compensation: '$75,000 Total Prizes',
      type: 'Hackathon'
    }
  ];

  for (const job of jobsData) {
    await prisma.job.create({
      data: {
        title: job.title,
        organization: job.organization,
        description: job.description,
        location: job.location,
        compensation: job.compensation,
        type: job.type,
        requirements: await mapSkills(job.skills)
      }
    });
  }

  console.log('Seeding Collab Space projects...');
  const collabs = [
    {
      title: 'Open Source AI Code Editor (Cursor Alternative)',
      description: 'Building an open-source, extensible code editor with deep AI integration using Rust and React. Looking for contributors passionate about developer tooling.',
      category: 'Working Together',
      projectType: 'Open Source',
      duration: '3-6 months',
      openRoles: 'Rust Developer, UI Designer',
      skills: 'Rust,React,TypeScript,Figma',
      creatorId: u4.id
    },
    {
      title: 'Local Farmers Market Connector App',
      description: 'A React Native mobile application to connect local farmers directly with consumers. Features inventory management and map integration.',
      category: 'Post a Need',
      projectType: 'Side Project',
      duration: '1-3 months',
      openRoles: 'React Native Dev, Backend (Node.js)',
      skills: 'React Native,Node.js,PostgreSQL',
      creatorId: u5.id
    },
    {
      title: 'Next.js & Tailwind High-End UI Library',
      description: 'Creating a beautiful, accessible UI component library for Next.js. The goal is to provide a premium alternative to existing open-source libraries like shadcn/ui.',
      category: 'How Collab Works',
      projectType: 'Open Source',
      duration: 'Ongoing',
      openRoles: 'Frontend Developer, Accessibility Expert',
      skills: 'Next.js,Tailwind CSS,Storybook,Framer Motion',
      creatorId: u2.id
    },
    {
      title: 'Fintech Dashboard SaaS MVP',
      description: 'A high-performance dashboard template for financial applications. Needs complex charts, real-time data integration, and a polished dark mode design.',
      category: 'Finance',
      projectType: 'Startup MVP',
      duration: '3-6 months',
      openRoles: 'Data Viz Engineer (D3/Recharts), UI Developer',
      skills: 'React,D3.js,Tailwind CSS',
      creatorId: u1.id
    },
    {
      title: 'AI Audio Transcription & Summary App',
      description: 'A desktop application that uses local LLMs (Llama 3) to transcribe and summarize audio recordings with complete privacy. Built with Electron.',
      category: 'Developer Tools',
      projectType: 'Startup MVP',
      duration: '1-3 months',
      openRoles: 'Python Dev (AI), Electron Developer',
      skills: 'Python,Electron,PyTorch,React',
      creatorId: u3.id
    },
    {
      title: 'Hackathon Partner: AI Agentic Shopping',
      description: 'Looking for a backend engineer and a designer to join me for the upcoming AI Agents hackathon this weekend! Building an autonomous shopping bot.',
      category: 'Hackathon',
      projectType: 'Hackathon',
      duration: '1-2 weeks',
      openRoles: 'Backend Node Dev, Figma UI Designer',
      skills: 'Node.js,Python,Figma',
      creatorId: u1.id
    },
    {
      title: 'Open Source LLM Benchmarking Suite',
      description: 'Collaborating on open-source evaluation harnesses for local small language models on edge devices (mobile/laptops).',
      category: 'AI Research',
      projectType: 'Research',
      duration: 'Ongoing',
      openRoles: 'ML Engineer, Data Scientist',
      skills: 'Python,PyTorch,HuggingFace,Benchmarking',
      creatorId: u3.id
    },
    {
      title: 'Creative 3D Portfolio Collaboration',
      description: 'Teaming up to design an immersive 3D interactive portfolio experience using Three.js and WebGL. Need a technical artist.',
      category: 'Creative Tech',
      projectType: 'Side Project',
      duration: '1 month',
      openRoles: 'Three.js Developer, 3D Modeler',
      skills: 'Three.js,GLSL,React,Creative Coding,Blender',
      creatorId: u2.id
    },
    {
      title: 'Solana Web3 Smart Contract Auditor Needed',
      description: 'We are building a decentralized AI compute marketplace. We need a Rust developer with Solana smart contract experience for an upcoming sprint.',
      category: 'Web3 / Crypto',
      projectType: 'Startup MVP',
      duration: '3+ months',
      openRoles: 'Rust Developer, Smart Contract Auditor',
      skills: 'Rust,Solana,Web3,Cryptography',
      creatorId: u4.id
    },
    {
      title: 'Algorithmic Trading Bot for Crypto',
      description: 'Building a low-latency trading bot integrating with Binance and Bybit APIs using Go. Looking for someone with quant trading experience.',
      category: 'Finance',
      projectType: 'Side Project',
      duration: '3-6 months',
      openRoles: 'Go Developer, Quant Analyst',
      skills: 'Go,Data Science,Finance,APIs',
      creatorId: u4.id
    },
    {
      title: 'Student Productivity Chrome Extension',
      description: 'A lightweight Chrome extension that blocks distracting sites and uses AI to summarize long PDFs. Perfect project for a student developer.',
      category: 'Productivity',
      projectType: 'Side Project',
      duration: '1-2 weeks',
      openRoles: 'JavaScript Developer',
      skills: 'JavaScript,Chrome Extension API,HTML/CSS',
      creatorId: u5.id
    },
    {
      title: 'AI Companion for the Elderly',
      description: 'Building a simple tablet app powered by conversational AI to combat loneliness in elderly care homes.',
      category: 'Working Together',
      projectType: 'Side Project',
      duration: '3 months',
      openRoles: 'React Native Dev, Prompt Engineer',
      skills: 'React Native,OpenAI API,UX Design',
      creatorId: u3.id
    },
    {
      title: 'Rust Web Framework Benchmarking',
      description: 'Setting up a comprehensive suite to benchmark Axum vs Actix-web under extreme load. Looking for performance geeks.',
      category: 'Developer Tools',
      projectType: 'Research',
      duration: '1 month',
      openRoles: 'Rust Developer, DevOps',
      skills: 'Rust,Docker,Load Testing,K6',
      creatorId: u4.id
    },
    {
      title: 'Design System for EdTech Startup',
      description: 'Need a UI/UX designer to help establish the core design tokens and component library for a new educational platform.',
      category: 'Creative Tech',
      projectType: 'Startup MVP',
      duration: '2 months',
      openRoles: 'UI/UX Designer',
      skills: 'Figma,Design Systems,CSS',
      creatorId: u2.id
    },
    {
      title: 'Decentralized Identity Protocol',
      description: 'Creating a privacy-first identity solution on Ethereum using Zero-Knowledge proofs.',
      category: 'Web3 / Crypto',
      projectType: 'Open Source',
      duration: 'Ongoing',
      openRoles: 'Solidity Developer, Cryptographer',
      skills: 'Solidity,ZK Proofs,Ethereum',
      creatorId: u1.id
    },
    {
      title: 'ML Models for Predicting Stock Volatility',
      description: 'Training time-series models to predict short-term volatility in tech stocks. Academic research project.',
      category: 'Finance',
      projectType: 'Research',
      duration: '4-6 months',
      openRoles: 'Data Scientist, Financial Analyst',
      skills: 'Python,Pandas,TensorFlow,Finance',
      creatorId: u5.id
    }
  ];

  for (const proj of collabs) {
    await prisma.collabRequest.create({
      data: {
        creatorId: proj.creatorId,
        title: proj.title,
        description: proj.description,
        category: proj.category,
        projectType: proj.projectType,
        duration: proj.duration,
        openRoles: proj.openRoles,
        status: 'open',
        requiredSkills: await mapSkills(proj.skills)
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
