// Content for the candidate panel. Project facts come from each project's own
// README; Lemma has only its one-line description so far.

export const PROJECT_IDS = ["lemma", "neoguard", "raise"] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

export interface ProjectDetail {
  id: ProjectId;
  name: string;
  blurb: string;
  summary: string;
  highlights: string[];
  status: string | null;
  link: string | null;
}

export const CANDIDATE = {
  name: "Shivani Jagannatham",
  pitch:
    "I ship real product fast in React and TypeScript. The role is building MCP Apps, so I built my application as one.",
} as const;

export const PROJECTS: Record<ProjectId, ProjectDetail> = {
  lemma: {
    id: "lemma",
    name: "Lemma",
    blurb:
      "Scorers that check whether a model's confidence matches its accuracy, and whether it abstains when it should.",
    summary:
      "Scorers that check whether a model's confidence matches its accuracy, and whether it abstains when it should.",
    highlights: [],
    status: null,
    link: null,
  },
  neoguard: {
    id: "neoguard",
    name: "NeoGuard",
    blurb:
      "Continuous neonatal pain monitoring: a facial model and a cry analyzer fused into one score on a nurse dashboard.",
    summary:
      "NICU neonates go through frequent painful procedures and are often too weak to cry visibly. NeoGuard explores continuous, multi-modal monitoring between nurse-scored assessments.",
    highlights: [
      "MediaPipe Face Mesh gates each frame for face presence and occlusion.",
      "A three-branch N-CNN scores each face crop, with MC dropout for uncertainty and temperature scaling.",
      "Uncertainty-weighted fusion with a cry analyzer, holding a stale score when both signals drop out.",
    ],
    status:
      "Research prototype, not a medical device. The facial model ships with random weights until it is trained on properly accessed data.",
    link: "https://github.com/shivanij1203/NeoGuard",
  },
  raise: {
    id: "raise",
    name: "RAISE",
    blurb: "A system of record for AI use in higher education.",
    summary:
      "Faculty, researchers and students register each AI use in one sentence. RAISE picks the use case, flags risks and generates compliance checkpoints.",
    highlights: [
      "Checkpoints across FERPA, HIPAA, IRB Common Rule, NIST AI RMF, ADA, Section 508 and Title VI/IX.",
      "Covers 8 use cases, 25 checkpoints and 12 regulatory and ethics dimensions.",
      "Verify Dataset runs a personal info scan, a FERPA check, data classification and a bias audit on one CSV.",
    ],
    status: "Prototype with synthetic demo data, gated to USF email addresses.",
    link: "https://github.com/shivanij1203/RAISE--Responsible-AI-Standards-and-Ethics",
  },
};
