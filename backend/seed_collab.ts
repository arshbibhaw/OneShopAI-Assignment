import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo_builder@example.com",
        name: "Demo Builder",
        username: "demobuilder",
      }
    });
  }

  const projects = [
    {
      title: "Open Source AI Code Editor",
      description: "Building an open-source, extensible code editor with deep AI integration using Rust and React. Looking for contributors who are passionate about developer tooling.",
      category: "Open Source",
      projectType: "Startup",
      duration: "3-6 months",
      openRoles: "Rust Developer, UI Designer",
      skills: ["Rust", "React", "TypeScript", "Figma"]
    },
    {
      title: "Local Farmers Market App",
      description: "A React Native mobile application to connect local farmers directly with consumers. Features include inventory management, map integration, and direct messaging.",
      category: "Social Impact",
      projectType: "Side Project",
      duration: "1-3 months",
      openRoles: "React Native Dev, Backend (Node.js)",
      skills: ["React Native", "Node.js", "PostgreSQL"]
    },
    {
      title: "Next.js Tailwind UI Library",
      description: "Creating a beautiful, accessible UI component library for Next.js and Tailwind CSS. The goal is to provide a premium alternative to existing open-source libraries.",
      category: "Open Source",
      projectType: "Side Project",
      duration: "Ongoing",
      openRoles: "Frontend Developer, Accessibility Expert",
      skills: ["Next.js", "Tailwind CSS", "Storybook"]
    },
    {
      title: "Fintech Dashboard Template",
      description: "A high-performance dashboard template for financial applications. Needs complex charts, real-time data integration, and a very polished dark mode design.",
      category: "SaaS",
      projectType: "Startup",
      duration: "3-6 months",
      openRoles: "Data Viz Engineer (D3/Recharts), UI Developer",
      skills: ["React", "D3.js", "Tailwind CSS", "Framer Motion"]
    },
    {
      title: "AI Audio Transcription Tool",
      description: "A desktop application that uses local LLMs to transcribe and summarize audio recordings with complete privacy. Built with Electron and Python.",
      category: "AI/ML",
      projectType: "Startup",
      duration: "1-3 months",
      openRoles: "Python Dev (AI), Electron Developer",
      skills: ["Python", "Electron", "PyTorch", "React"]
    }
  ];

  console.log(`Seeding projects for user ${user.username}...`);

  for (const proj of projects) {
    await prisma.collabRequest.create({
      data: {
        creatorId: user.id,
        title: proj.title,
        description: proj.description,
        category: proj.category,
        projectType: proj.projectType,
        duration: proj.duration,
        openRoles: proj.openRoles,
        status: "open",
        requiredSkills: {
          connectOrCreate: proj.skills.map(s => ({
            where: { name: s },
            create: { name: s }
          }))
        }
      }
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
