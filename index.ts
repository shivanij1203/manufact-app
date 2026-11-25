import { MCPServer } from "mcp-use";
import { z } from "zod";
import { CANDIDATE, PROJECT_IDS, PROJECTS } from "./data/candidate.js";

const server = new MCPServer({
  name: "manufact-app",
  title: "Candidate panel",
  version: "1.0.0",
  description: "A candidate panel with a pitch and three projects, each opening into detail.",
  instructions:
    "Call show-candidate to open the candidate panel. The user can click a project to see its detail; the panel reports the selected project as model context.",
  icons: [{ src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] }],
});

const projectId = z.enum(PROJECT_IDS).describe("Project id: lemma, neoguard or raise");

const projectSummary = z.object({
  id: projectId,
  name: z.string().describe("Project name"),
  blurb: z.string().describe("One-line description"),
});

const projectDetail = projectSummary.extend({
  summary: z.string().describe("What the project is and why it exists"),
  highlights: z.array(z.string()).describe("Key technical points; may be empty"),
  status: z.string().nullable().describe("Maturity and limits, when stated"),
  link: z.string().nullable().describe("Source repository URL, when public"),
});

const showCandidateInput = z.object({
  project: projectId.optional().describe("Open the panel with this project already selected"),
});

const showCandidateOutput = z.object({
  name: z.string().describe("Candidate name"),
  pitch: z.string().describe("One-line pitch"),
  projects: z.array(projectSummary).describe("Projects shown as chips"),
  initialProject: projectId.nullable().describe("Project to select when the panel opens"),
});

export const showCandidate = server.tool(
  {
    name: "show-candidate",
    title: "Show candidate panel",
    description: "Open a panel with the candidate's name, pitch and projects (Lemma, NeoGuard, RAISE).",
    inputSchema: showCandidateInput,
    outputSchema: showCandidateOutput,
    view: {
      name: "candidate-panel",
      description: "Candidate pitch with project chips that open project detail in place",
      prefersBorder: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async ({ project }) => {
    const data = {
      name: CANDIDATE.name,
      pitch: CANDIDATE.pitch,
      projects: PROJECT_IDS.map((id) => ({ id, name: PROJECTS[id].name, blurb: PROJECTS[id].blurb })),
      initialProject: project ?? null,
    };
    const text = `${data.name}: ${data.pitch} Projects: ${data.projects.map((p) => `${p.name} (${p.blurb})`).join("; ")}`;
    return { content: [{ type: "text", text }], structuredContent: data };
  }
);

export const getProject = server.tool(
  {
    name: "get-project",
    title: "Get project detail",
    description: "Return the detail for one of the candidate's projects.",
    inputSchema: z.object({ id: projectId }),
    outputSchema: projectDetail,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async ({ id }) => {
    const p = PROJECTS[id];
    const text = [`${p.name}: ${p.summary}`, ...p.highlights.map((h) => `- ${h}`), p.status ?? "", p.link ?? ""].filter(Boolean).join("\n");
    return { content: [{ type: "text", text }], structuredContent: p };
  }
);

export default server;
