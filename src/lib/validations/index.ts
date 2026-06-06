import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const userSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum([
    "ADMIN",
    "MANAGEMENT",
    "DEPARTMENT_HEAD",
    "PROJECT_MANAGER",
    "TEAM_MEMBER",
    "VIEW_ONLY",
  ]),
  divisionId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const divisionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const departmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  divisionId: z.string().min(1, "Division is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  clientId: z.string().optional().nullable(),
  clientName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
});

export const meetingSchema = z.object({
  title: z.string().min(2, "Title is required"),
  meetingType: z.enum([
    "INTERNAL_MANAGEMENT",
    "CLIENT",
    "PROJECT",
    "SALES",
    "FINANCE",
    "HR",
    "DELIVERY",
    "STRATEGIC_PLANNING",
    "ISSUE_RESOLUTION",
  ]),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().optional(),
  onlineMeetingLink: z.string().url().optional().or(z.literal("")),
  divisionId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  ownerId: z.string().min(1, "Owner is required"),
  attendeeIds: z.array(z.string()).default([]),
  absenteeIds: z.array(z.string()).default([]),
  agenda: z.string().optional(),
  discussionSummary: z.string().optional(),
  keyDiscussionPoints: z.string().optional(),
  importantNotes: z.string().optional(),
  concernsRaised: z.string().optional(),
  risksIdentified: z.string().optional(),
  status: z.enum(["DRAFT", "FINALIZED"]).default("DRAFT"),
});

export const decisionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
  meetingId: z.string().optional().nullable(),
  divisionId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  ownerId: z.string().min(1, "Owner is required"),
  approvedById: z.string().optional().nullable(),
  dateDecided: z.string().min(1, "Date is required"),
  impactArea: z.string().optional(),
  status: z.enum([
    "PROPOSED",
    "APPROVED",
    "REJECTED",
    "ON_HOLD",
    "REVERSED",
    "SUPERSEDED",
  ]).default("PROPOSED"),
  remarks: z.string().optional(),
});

export const actionItemSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  status: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "BLOCKED",
    "CANCELLED",
  ]).default("NOT_STARTED"),
  meetingId: z.string().optional().nullable(),
  decisionId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  completionNotes: z.string().optional(),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  divisionId: z.string().optional(),
  departmentId: z.string().optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  meetingType: z.string().optional(),
  decisionStatus: z.string().optional(),
  actionStatus: z.string().optional(),
  attendeeId: z.string().optional(),
  assignedToId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
