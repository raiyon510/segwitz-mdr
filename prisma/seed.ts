import "dotenv/config";
import { PrismaClient, Role, MeetingType, MeetingStatus, DecisionStatus, ActionPriority, ActionStatus, ProjectStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { DIVISIONS, DEPARTMENTS } from "../src/lib/constants";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding SegWitz Meeting & Decision Repository...");

  const divisionMap: Record<string, string> = {};
  for (const divName of DIVISIONS) {
    const div = await prisma.division.upsert({
      where: { name: divName },
      update: {},
      create: { name: divName, description: `${divName} at SegWitz` },
    });
    divisionMap[divName] = div.id;
  }

  const departmentMap: Record<string, string> = {};
  for (const [divName, deptNames] of Object.entries(DEPARTMENTS)) {
    for (const deptName of deptNames) {
      const dept = await prisma.department.upsert({
        where: { name: deptName },
        update: {},
        create: {
          name: deptName,
          divisionId: divisionMap[divName],
          description: `${deptName} department`,
        },
      });
      departmentMap[deptName] = dept.id;
    }
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@segwitz.com" },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: "admin@segwitz.com",
      password: hashedPassword,
      fullName: "System Administrator",
      role: Role.ADMIN,
      divisionId: divisionMap["Leadership / Management"],
      departmentId: departmentMap["Strategic Planning / Governance"],
      isActive: true,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: "pm@segwitz.com" },
    update: {},
    create: {
      email: "pm@segwitz.com",
      password: await bcrypt.hash("Pm@123456", 12),
      fullName: "Sarah Johnson",
      role: Role.PROJECT_MANAGER,
      divisionId: divisionMap["Delivery Division"],
      departmentId: departmentMap["Project Management"],
      isActive: true,
    },
  });

  const teamMember = await prisma.user.upsert({
    where: { email: "dev@segwitz.com" },
    update: {},
    create: {
      email: "dev@segwitz.com",
      password: await bcrypt.hash("Dev@123456", 12),
      fullName: "Alex Chen",
      role: Role.TEAM_MEMBER,
      divisionId: divisionMap["Delivery Division"],
      departmentId: departmentMap["Frontend Development"],
      isActive: true,
    },
  });

  const management = await prisma.user.upsert({
    where: { email: "ceo@segwitz.com" },
    update: {},
    create: {
      email: "ceo@segwitz.com",
      password: await bcrypt.hash("Ceo@123456", 12),
      fullName: "Michael Roberts",
      role: Role.MANAGEMENT,
      divisionId: divisionMap["Leadership / Management"],
      departmentId: departmentMap["Strategic Planning / Governance"],
      isActive: true,
    },
  });

  const client1 = await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: {},
    create: {
      id: "seed-client-1",
      name: "Acme Corporation",
      contactPerson: "John Smith",
      email: "john@acme.com",
      phone: "+1-555-0100",
      notes: "Key enterprise client",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "seed-client-2" },
    update: {},
    create: {
      id: "seed-client-2",
      name: "TechStart Inc",
      contactPerson: "Emily Davis",
      email: "emily@techstart.io",
      phone: "+1-555-0200",
    },
  });

  const project1 = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      name: "Acme Portal Redesign",
      clientId: client1.id,
      clientName: client1.name,
      description: "Complete redesign of the client portal with modern UI/UX",
      status: ProjectStatus.ACTIVE,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "seed-project-2" },
    update: {},
    create: {
      id: "seed-project-2",
      name: "TechStart Mobile App",
      clientId: client2.id,
      clientName: client2.name,
      description: "Cross-platform mobile application development",
      status: ProjectStatus.ACTIVE,
    },
  });

  const meeting1 = await prisma.meeting.upsert({
    where: { id: "seed-meeting-1" },
    update: {},
    create: {
      id: "seed-meeting-1",
      title: "Q2 Project Kickoff - Acme Portal",
      meetingType: MeetingType.PROJECT,
      date: new Date("2026-05-15"),
      time: "10:00 AM",
      location: "Conference Room A",
      onlineMeetingLink: "https://meet.segwitz.com/acme-kickoff",
      divisionId: divisionMap["Delivery Division"],
      departmentId: departmentMap["Project Management"],
      projectId: project1.id,
      clientId: client1.id,
      ownerId: pm.id,
      agenda: "1. Project scope review\n2. Timeline discussion\n3. Resource allocation\n4. Risk assessment",
      discussionSummary: "Team aligned on project scope and timeline. Key milestones agreed upon for Q2 delivery.",
      keyDiscussionPoints: "- MVP features prioritized\n- Design phase starts next week\n- Weekly standups scheduled",
      importantNotes: "Client expects beta release by end of Q2",
      concernsRaised: "Third-party API integration timeline may be tight",
      risksIdentified: "Dependency on client for content delivery",
      status: MeetingStatus.FINALIZED,
      createdById: pm.id,
      finalizedById: pm.id,
      finalizedAt: new Date("2026-05-15"),
    },
  });

  await prisma.meetingAttendee.createMany({
    data: [
      { meetingId: meeting1.id, userId: pm.id },
      { meetingId: meeting1.id, userId: teamMember.id },
      { meetingId: meeting1.id, userId: admin.id },
    ],
    skipDuplicates: true,
  });

  await prisma.meeting.upsert({
    where: { id: "seed-meeting-2" },
    update: {},
    create: {
      id: "seed-meeting-2",
      title: "Monthly Management Review",
      meetingType: MeetingType.INTERNAL_MANAGEMENT,
      date: new Date("2026-06-01"),
      time: "2:00 PM",
      location: "Board Room",
      divisionId: divisionMap["Leadership / Management"],
      departmentId: departmentMap["Strategic Planning / Governance"],
      ownerId: management.id,
      agenda: "1. Financial review\n2. Pipeline update\n3. Strategic initiatives",
      discussionSummary: "Strong Q1 performance. Pipeline healthy with 3 new opportunities.",
      status: MeetingStatus.DRAFT,
      createdById: management.id,
    },
  });

  const decision1 = await prisma.decision.upsert({
    where: { id: "seed-decision-1" },
    update: {},
    create: {
      id: "seed-decision-1",
      title: "Approve React + Next.js for Acme Portal",
      description: "Decision to use React with Next.js 15 as the frontend framework for the Acme Portal Redesign project.",
      meetingId: meeting1.id,
      divisionId: divisionMap["Delivery Division"],
      departmentId: departmentMap["Frontend Development"],
      projectId: project1.id,
      clientId: client1.id,
      ownerId: pm.id,
      approvedById: management.id,
      dateDecided: new Date("2026-05-15"),
      impactArea: "Technology Stack",
      status: DecisionStatus.APPROVED,
      remarks: "Approved unanimously by project stakeholders",
      createdById: pm.id,
    },
  });

  await prisma.decisionStatusHistory.createMany({
    data: [
      {
        decisionId: decision1.id,
        fromStatus: null,
        toStatus: DecisionStatus.PROPOSED,
        changedById: pm.id,
        remarks: "Initial proposal",
      },
      {
        decisionId: decision1.id,
        fromStatus: DecisionStatus.PROPOSED,
        toStatus: DecisionStatus.APPROVED,
        changedById: management.id,
        remarks: "Approved by management",
      },
    ],
    skipDuplicates: true,
  });

  const decision2 = await prisma.decision.upsert({
    where: { id: "seed-decision-2" },
    update: {},
    create: {
      id: "seed-decision-2",
      title: "Hire 2 Additional Frontend Developers",
      description: "Proposal to hire 2 senior frontend developers to support increased project demand in Q2-Q3.",
      divisionId: divisionMap["Delivery Division"],
      departmentId: departmentMap["Frontend Development"],
      ownerId: admin.id,
      dateDecided: new Date("2026-06-01"),
      impactArea: "Human Resources",
      status: DecisionStatus.PROPOSED,
      createdById: admin.id,
    },
  });

  await prisma.decisionStatusHistory.create({
    data: {
      decisionId: decision2.id,
      fromStatus: null,
      toStatus: DecisionStatus.PROPOSED,
      changedById: admin.id,
      remarks: "Pending management approval",
    },
  });

  await prisma.actionItem.upsert({
    where: { id: "seed-action-1" },
    update: {},
    create: {
      id: "seed-action-1",
      title: "Set up Next.js project repository",
      description: "Initialize the Next.js 15 project with TypeScript, Tailwind, and CI/CD pipeline",
      assignedToId: teamMember.id,
      dueDate: new Date("2026-05-22"),
      priority: ActionPriority.HIGH,
      status: ActionStatus.COMPLETED,
      meetingId: meeting1.id,
      decisionId: decision1.id,
      projectId: project1.id,
      completionNotes: "Repository created with full CI/CD setup on GitHub Actions",
      createdById: pm.id,
    },
  });

  await prisma.actionItem.upsert({
    where: { id: "seed-action-2" },
    update: {},
    create: {
      id: "seed-action-2",
      title: "Create UI/UX wireframes for portal",
      description: "Design wireframes for all main portal screens",
      assignedToId: teamMember.id,
      dueDate: new Date("2026-06-10"),
      priority: ActionPriority.HIGH,
      status: ActionStatus.IN_PROGRESS,
      meetingId: meeting1.id,
      projectId: project1.id,
      createdById: pm.id,
    },
  });

  await prisma.actionItem.upsert({
    where: { id: "seed-action-3" },
    update: {},
    create: {
      id: "seed-action-3",
      title: "Prepare hiring plan for frontend team",
      description: "Draft job descriptions and recruitment timeline",
      assignedToId: admin.id,
      dueDate: new Date("2026-05-01"),
      priority: ActionPriority.CRITICAL,
      status: ActionStatus.NOT_STARTED,
      decisionId: decision2.id,
      createdById: admin.id,
    },
  });

  await prisma.auditLog.createMany({
    data: [
      { entityType: "Meeting", entityId: meeting1.id, action: "CREATE", userId: pm.id, details: "Created meeting: Q2 Project Kickoff" },
      { entityType: "Meeting", entityId: meeting1.id, action: "FINALIZE", userId: pm.id, details: "Meeting finalized" },
      { entityType: "Decision", entityId: decision1.id, action: "CREATE", userId: pm.id, details: "Created decision" },
      { entityType: "Decision", entityId: decision1.id, action: "STATUS_CHANGE", userId: management.id, details: "Status changed to APPROVED" },
    ],
  });

  console.log("✅ Seed completed!");
  console.log("  Admin: admin@segwitz.com / Admin@123");
  console.log("  PM:    pm@segwitz.com / Pm@123456");
  console.log("  Dev:   dev@segwitz.com / Dev@123456");
  console.log("  CEO:   ceo@segwitz.com / Ceo@123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
