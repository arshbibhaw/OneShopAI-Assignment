import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  await prisma.job.deleteMany();
  await prisma.collabMember.deleteMany();
  await prisma.collabRequest.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'arsh@oneshopai.com',
      username: 'arsh',
      name: 'Arsh',
      profile: {
        create: {
          bio: 'Full-stack developer building cool AI tools.',
          skills: 'React,Node.js,PostgreSQL,Tailwind CSS',
          currentRole: 'founder',
          organization: 'OneShopAI',
          location: 'Bangalore, India',
          linkedinUrl: 'https://linkedin.com/in/arsh',
          githubUrl: 'https://github.com/arsh'
        }
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sam@oneshopai.com',
      username: 'sam',
      name: 'Sam',
      profile: {
        create: {
          bio: 'UI/UX Designer who occasionally codes. Love animations.',
          skills: 'Figma,Framer Motion,React,CSS',
          currentRole: 'employee',
          organization: 'Figma',
          location: 'San Francisco, CA',
          linkedinUrl: 'https://linkedin.com/in/sam',
          githubUrl: 'https://github.com/sam'
        }
      }
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'alex@oneshopai.com',
      username: 'alexrivera',
      name: 'Alex Rivera',
      profile: {
        create: {
          bio: 'Data Scientist passionate about LLMs and Retrieval-Augmented Generation.',
          skills: 'Python,PyTorch,SQL,Machine Learning,NLP',
          currentRole: 'student',
          organization: 'Stanford University',
          location: 'Stanford, CA',
          linkedinUrl: 'https://linkedin.com/in/alexrivera',
          githubUrl: 'https://github.com/alexrivera'
        }
      }
    }
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'jordan@oneshopai.com',
      username: 'jordanlee',
      name: 'Jordan Lee',
      profile: {
        create: {
          bio: 'Backend Engineer scaling distributed systems. Open-source contributor.',
          skills: 'Go,Rust,Kubernetes,Docker,PostgreSQL',
          currentRole: 'employee',
          organization: 'Stripe',
          location: 'Seattle, WA',
          linkedinUrl: 'https://linkedin.com/in/jordanlee',
          githubUrl: 'https://github.com/jordanlee'
        }
      }
    }
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'casey@oneshopai.com',
      username: 'caseysmith',
      name: 'Casey Smith',
      profile: {
        create: {
          bio: 'Growth Hacker and Product Manager. Bridging the gap between engineering and marketing.',
          skills: 'Product Strategy,SEO,Data Analytics,Growth Marketing,Agile',
          currentRole: 'founder',
          organization: 'GrowthLab AI',
          location: 'Austin, TX',
          linkedinUrl: 'https://linkedin.com/in/caseysmith',
          githubUrl: 'https://github.com/caseysmith'
        }
      }
    }
  });

  const user6 = await prisma.user.create({
    data: {
      email: 'maya@oneshopai.com',
      username: 'mayachen',
      name: 'Maya Chen',
      profile: {
        create: {
          bio: 'Mobile App Developer specialized in React Native and iOS Swift. Building cross-platform experiences.',
          skills: 'React Native,Swift,Kotlin,TypeScript,GraphQL',
          currentRole: 'student',
          organization: 'UC Berkeley',
          location: 'Berkeley, CA',
          linkedinUrl: 'https://linkedin.com/in/mayachen',
          githubUrl: 'https://github.com/mayachen'
        }
      }
    }
  });

  const user7 = await prisma.user.create({
    data: {
      email: 'liam@oneshopai.com',
      username: 'liampatel',
      name: 'Liam Patel',
      profile: {
        create: {
          bio: 'Cybersecurity Analyst & DevSecOps advocate. Ensuring secure cloud infrastructure and zero-trust systems.',
          skills: 'Security,AWS,Terraform,Docker,Python,Networking',
          currentRole: 'employee',
          organization: 'Cloudflare',
          location: 'London, UK',
          linkedinUrl: 'https://linkedin.com/in/liampatel',
          githubUrl: 'https://github.com/liampatel'
        }
      }
    }
  });

  const user8 = await prisma.user.create({
    data: {
      email: 'sophia@oneshopai.com',
      username: 'sophiarodriguez',
      name: 'Sophia Rodriguez',
      profile: {
        create: {
          bio: '3D Artist and WebGL Creative Technologist. Bringing interactive graphics and 3D worlds to the browser.',
          skills: 'Three.js,Blender,GLSL,React Three Fiber,Creative Coding',
          currentRole: 'founder',
          organization: 'SpatialStudio',
          location: 'New York, NY',
          linkedinUrl: 'https://linkedin.com/in/sophiarodriguez',
          githubUrl: 'https://github.com/sophiarodriguez'
        }
      }
    }
  });

  const user9 = await prisma.user.create({
    data: {
      email: 'devika@oneshopai.com',
      username: 'devikanair',
      name: 'Devika Nair',
      profile: {
        create: {
          bio: 'AI Product Specialist & Prompt Engineer. Designing intuitive human-in-the-loop workflows.',
          skills: 'Prompt Engineering,LLMs,Product Strategy,Python,Evaluation',
          currentRole: 'student',
          organization: 'IIT Delhi',
          location: 'New Delhi, India',
          linkedinUrl: 'https://linkedin.com/in/devikanair',
          githubUrl: 'https://github.com/devikanair'
        }
      }
    }
  });

  // Create Jobs
  const jobs = [
    {
      title: 'Senior Frontend Engineer',
      organization: 'OneShopAI',
      description: 'We are looking for a Senior Frontend Engineer to lead the development of our core web platform. You will work heavily with React, TypeScript, and modern UI engineering.',
      requirements: '5+ years React,Deep understanding of web performance,Experience with TypeScript',
      location: 'Remote, India',
      compensation: '₹28,00,000 - ₹38,00,000 / yr',
      type: 'full-time'
    },
    {
      title: 'AI Systems Researcher (Generative AI)',
      organization: 'OneShopAI Research',
      description: 'Join our research lab to build the next generation of multimodal and generative agent architectures. Train large scale models and optimize agent reasoning pipelines.',
      requirements: 'MS/PhD in Computer Science or equivalent,PyTorch & CUDA expertise,Large language model finetuning',
      location: 'Bangalore, India',
      compensation: '₹35,00,000 - ₹50,00,000 / yr',
      type: 'full-time'
    },
    {
      title: 'Full Stack Product Engineer',
      organization: 'Stripe',
      description: 'Build financial tools that empower millions of internet businesses. Work with React, TypeScript, and distributed backend systems.',
      requirements: '3+ years experience with React and TypeScript,API design,High scalability mindset',
      location: 'Remote, Global',
      compensation: '$140,000 - $175,000 / yr',
      type: 'full-time'
    },
    {
      title: 'Product Design Engineer',
      organization: 'Linear',
      description: 'Help craft the next generation of modern project management software. You will design, prototype, and build production web interactions with obsession for craft and speed.',
      requirements: 'Figma proficiency,Advanced CSS & Tailwind,React & TypeScript experience',
      location: 'San Francisco, CA / Remote',
      compensation: '$150,000 - $185,000 / yr',
      type: 'full-time'
    },
    {
      title: 'Developer Advocate & Community Lead',
      organization: 'Vercel',
      description: 'Grow and support the global Next.js & React developer ecosystem. Create technical guides, build reference open source demos, and mentor developers.',
      requirements: 'Strong technical writing skills,Public speaking,Deep knowledge of Next.js & web ecosystem',
      location: 'Remote',
      compensation: '$120,000 - $150,000 / yr',
      type: 'full-time'
    },
    // Internships
    {
      title: 'AI Research & Reasoning Intern (Summer 2026)',
      organization: 'Google DeepMind',
      description: 'Work alongside world-class scientists investigating agentic memory, test-time compute, and algorithmic reasoning benchmarks. Fully mentored program with publishable research projects.',
      requirements: 'Pursuing BS/MS/PhD in CS/Math,PyTorch or JAX,Strong foundations in deep learning',
      location: 'London, UK / New York, NY',
      compensation: '$58 / hr + Housing Stipend',
      type: 'Internship'
    },
    {
      title: 'Frontend Engineering Intern',
      organization: 'Figma',
      description: 'Work on Figma web infrastructure, canvas rendering performance, or collaboration features. Collaborate closely with designers and senior engineers.',
      requirements: 'Enrolled in undergraduate or graduate program,Strong JavaScript/TypeScript & WebGL/Canvas interest',
      location: 'San Francisco, CA (Hybrid)',
      compensation: '$52 / hr',
      type: 'Internship'
    },
    {
      title: 'Software Engineer Intern - Core Systems',
      organization: 'Anthropic',
      description: 'Help develop reliable infrastructure powering frontier AI models. You will tackle distributed systems challenges, latency optimization, and developer tooling.',
      requirements: 'Strong CS fundamentals,Proficiency in Python or Go/Rust,Curiosity for AI safety',
      location: 'San Francisco, CA',
      compensation: '$60 / hr + Benefits',
      type: 'Internship'
    },
    {
      title: 'Open Source Fellow & Intern',
      organization: 'Supabase',
      description: 'Build backend SDKs, database integrations, and developer toolkits. Contribute directly to our open-source repositories with thousands of stars.',
      requirements: 'Postgres knowledge,TypeScript & Node.js,Passion for open source',
      location: 'Remote',
      compensation: '$40 / hr',
      type: 'Internship'
    },
    // Hackathons
    {
      title: 'OneShopAI Global Agentic AI Hackathon 2026',
      organization: 'OneShopAI Community',
      description: 'Build the next generation of autonomous AI assistants, shopping agents, and workflow automations. Win $50,000 in cash prizes, cloud credits, and direct investor pitch sessions.',
      requirements: 'Teams of 1-4,Must use AI agents or LLM APIs,Open source project submission',
      location: 'Virtual / Online',
      compensation: '$50,000 Prize Pool',
      type: 'Hackathon'
    },
    {
      title: 'HackMIT 2026 - Autonomous Web Sprint',
      organization: 'MIT Tech Club',
      description: '36-hour sprint where top builders worldwide come together to prototype intelligent systems, collaborative software, and creative tools.',
      requirements: 'Open to college students & recent grads,All tech stacks welcome',
      location: 'Cambridge, MA (Travel Grants Available)',
      compensation: '$30,000 Prizes + Sponsor Perks',
      type: 'Hackathon'
    },
    {
      title: 'Solana Global AI x Web3 Hackathon',
      organization: 'Solana Foundation',
      description: 'Create high-throughput decentralized applications combining zero-knowledge proofs, AI compute verification, and micro-payments.',
      requirements: 'Rust or TypeScript,Smart contract or AI integration',
      location: 'Virtual',
      compensation: '$100,000 Total Pool',
      type: 'Hackathon'
    },
    // Scholarships
    {
      title: 'Generation Google STEM Fellowship 2026',
      organization: 'Google',
      description: 'Awarded to aspiring computer scientists demonstrating strong academic achievement, leadership, and passion for improving diversity and representation in technology.',
      requirements: 'Currently enrolled in an undergraduate or graduate degree,Passion for CS',
      location: 'North America & APAC',
      compensation: '$10,000 Merit Grant',
      type: 'Scholarship'
    },
    {
      title: 'OneShopAI NextGen Tech Scholars Program',
      organization: 'OneShopAI Foundation',
      description: 'Providing tuition support, hardware grants, and 1-on-1 industry mentorship for student builders actively developing AI tools and community platforms.',
      requirements: 'Enrolled student,Portfolio of at least 1 deployed project or open source PR',
      location: 'Global / Remote',
      compensation: '₹2,50,000 Fellowship + Mentorship',
      type: 'Scholarship'
    },
    {
      title: 'Palantir Future Tech Builders Scholarship',
      organization: 'Palantir Technologies',
      description: 'Supports visionary undergraduate students who are pushing boundaries in critical software systems, data engineering, and ethical AI applications.',
      requirements: 'Sophomore or Junior in STEM,Essay submission & technical problem solving demo',
      location: 'United States & Canada',
      compensation: '$7,000 Grant + Summer Fast-track',
      type: 'Scholarship'
    }
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  // Create Collab Requests
  await prisma.collabRequest.create({
    data: {
      title: 'AI Image Generator Frontend',
      description: 'Need a solid frontend engineer to help me build out a Next.js interface for my Stable Diffusion backend.',
      requiredSkills: 'Next.js,Tailwind,API Integration',
      category: 'Working Together',
      creatorId: user1.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'Hackathon Partner: AI Agents',
      description: 'Looking for a backend engineer and a designer to join me for the upcoming AI Agents hackathon this weekend!',
      requiredSkills: 'Node.js,Python,Figma',
      category: 'Post a Need',
      creatorId: user2.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'What is Collab Space?',
      description: 'A beginner\'s guide on how to utilize Collab Space to find the perfect team for your next big idea.',
      requiredSkills: 'Community,Guides',
      category: 'How Collab Works',
      creatorId: user1.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'Need UI/UX for E-commerce MVP',
      description: 'Looking for a designer to create wireframes and high fidelity designs for a new AI e-commerce platform.',
      requiredSkills: 'Figma,UI/UX',
      category: 'Post a Need',
      creatorId: user1.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'Weekly Standup for Solo Founders',
      description: 'A channel for solo founders to share updates, blockages and collaborate on overcoming hurdles.',
      requiredSkills: 'Founder,Motivation',
      category: 'Working Together',
      creatorId: user2.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'How to Find the Right Teammate',
      description: 'Best practices on matching skills, setting expectations, and kicking off project sprints smoothly.',
      requiredSkills: 'Team Building,Collaboration,Communication',
      category: 'How Collab Works',
      creatorId: user6.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'Mobile Dev for Fitness Tracking App',
      description: 'Looking for a React Native or Flutter engineer to build an offline-first fitness and calorie tracking app.',
      requiredSkills: 'React Native,Flutter,Mobile,Firebase',
      category: 'Post a Need',
      creatorId: user7.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'Open Source LLM Benchmarking Suite',
      description: 'Collaborating on open-source evaluation harnesses for local small language models on edge devices.',
      requiredSkills: 'Python,PyTorch,HuggingFace,Benchmarking',
      category: 'Working Together',
      creatorId: user8.id
    }
  });

  await prisma.collabRequest.create({
    data: {
      title: 'Creative 3D Portfolio Collaboration',
      description: 'Teaming up to design an immersive 3D interactive portfolio experience using Three.js and WebGL.',
      requiredSkills: 'Three.js,GLSL,React,Creative Coding',
      category: 'Working Together',
      creatorId: user9.id
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
