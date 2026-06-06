export const MEETING_TYPES = [
  { value: "INTERNAL_MANAGEMENT", label: "Internal Management Meeting" },
  { value: "CLIENT", label: "Client Meeting" },
  { value: "PROJECT", label: "Project Meeting" },
  { value: "SALES", label: "Sales Meeting" },
  { value: "FINANCE", label: "Finance Meeting" },
  { value: "HR", label: "HR Meeting" },
  { value: "DELIVERY", label: "Delivery Meeting" },
  { value: "STRATEGIC_PLANNING", label: "Strategic Planning Meeting" },
  { value: "ISSUE_RESOLUTION", label: "Issue Resolution Meeting" },
] as const;

export const DECISION_STATUSES = [
  { value: "PROPOSED", label: "Proposed" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "REVERSED", label: "Reversed" },
  { value: "SUPERSEDED", label: "Superseded" },
] as const;

export const ACTION_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export const ACTION_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const PROJECT_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const DIVISIONS = [
  "Business Division",
  "Delivery Division",
  "Corporate Services Division",
  "Leadership / Management",
] as const;

export const DEPARTMENTS: Record<string, string[]> = {
  "Business Division": [
    "Sales / Business Development",
    "Marketing",
    "Account Management",
  ],
  "Delivery Division": [
    "Project Management",
    "UI/UX Design",
    "Frontend Development",
    "Backend Development",
    "Mobile App Development",
    "QA / Testing",
    "DevOps / Deployment",
  ],
  "Corporate Services Division": [
    "HR",
    "Finance / Accounts",
    "Administration",
    "Internal Operations",
  ],
  "Leadership / Management": ["Strategic Planning / Governance"],
};
