/** Candidate panel: the pitch, a row of project chips, and the selected project's detail in place. */
import {
  ModelContext,
  ThemeProvider,
  useCallTool,
  useToolContext,
  useViewState,
  useViewTheme,
} from "mcp-use/react";
import { useEffect } from "react";
import "./view.css";

type ProjectId = "lemma" | "neoguard" | "raise";

export default function CandidatePanel() {
  const view = useToolContext<"show-candidate">();
  const theme = useViewTheme();
  const project = useCallTool("get-project");
  // Model-visible view state: the host model can see which project is open.
  const [state, setState] = useViewState<{ selected: ProjectId | null }>({ selected: null });

  const ready = view.status === "ready" ? view.toolOutput : null;
  const detail = project.data?.structuredContent ?? null;
  const shown = detail && detail.id === state.selected ? detail : null;

  function select(id: ProjectId) {
    setState({ selected: id });
    void project.callTool({ id }).catch(() => undefined); // the error is shown from project.error
  }

  // Open the project the tool asked for, or restore the one selected before a reload.
  useEffect(() => {
    if (!ready) return;
    const want = state.selected ?? ready.initialProject;
    if (want && !project.isPending && project.data?.structuredContent.id !== want) select(want);
    // run once the result is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <ThemeProvider colorScheme>
      <section className="panel" data-theme={theme} aria-busy={view.status === "pending" || project.isPending}>
        {view.status === "pending" && <Skeleton />}
        {view.status === "error" && <p className="error" role="alert">The panel could not load: {view.error.message}</p>}
        {ready && (
          <>
            <ModelContext
              content={
                shown
                  ? `The panel shows ${ready.name}'s project ${shown.name}: ${shown.summary}`
                  : state.selected
                    ? `The panel is opening ${ready.name}'s project ${nameOf(ready.projects, state.selected)}.`
                    : `The panel shows ${ready.name}'s pitch and three projects; none is selected yet.`
              }
            />
            <header className="head">
              <h1 className="name">{ready.name}</h1>
              <p className="pitch">{ready.pitch}</p>
            </header>

            <div className="chips" role="group" aria-label="Projects">
              {ready.projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="chip"
                  aria-pressed={state.selected === p.id}
                  title={p.blurb}
                  onClick={() => select(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="detail" aria-live="polite">
              {!state.selected && (
                <ul className="blurbs">
                  {ready.projects.map((p) => (
                    <li key={p.id}><b>{p.name}</b> <span>{p.blurb}</span></li>
                  ))}
                </ul>
              )}
              {state.selected && project.isPending && <p className="muted">Loading {nameOf(ready.projects, state.selected)}…</p>}
              {state.selected && !project.isPending && project.error && (
                <p className="error" role="alert">Could not load {nameOf(ready.projects, state.selected)}: {project.error.message}</p>
              )}
              {shown && !project.isPending && (
                <article className="card" key={shown.id}>
                  <header className="card-head">
                    <h2 className="card-title">{shown.name}</h2>
                    {shown.link && (
                      <a className="card-link" href={shown.link} target="_blank" rel="noreferrer">
                        Source on GitHub
                        <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M4 2.5h5.5V8M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </a>
                    )}
                  </header>
                  <p className="summary">{shown.summary}</p>
                  {shown.highlights.length > 0 && (
                    <ul className="highlights">
                      {shown.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  )}
                  {shown.status && <p className="status">{shown.status}</p>}
                </article>
              )}
            </div>
          </>
        )}
      </section>
    </ThemeProvider>
  );
}

function nameOf(projects: { id: string; name: string }[], id: string): string {
  return projects.find((p) => p.id === id)?.name ?? id;
}

function Skeleton() {
  return (
    <div className="skeleton" aria-hidden>
      <span className="bar w40" />
      <span className="bar w80" />
      <span className="bar w60" />
    </div>
  );
}
