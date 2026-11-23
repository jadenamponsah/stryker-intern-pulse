/**
 * Placeholder home page — replace this with the app's real home.
 *
 * This is intentionally unstyled scaffolding, not a design to build on.
 * Design the app's own look (layout, theme tokens, typography) from your
 * product's point of view instead of extending this page.
 */

import { useEffect, useState, type SyntheticEvent } from "react";
import { useInternshipTracker } from "@/hooks/(app)/useInternshipTracker";
import type { ApplicationStatus } from "@/schemas/internship-schema";

const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  accentClass: string;
}[] = [
  {
    status: "applied",
    label: "Applied",
    accentClass: "border-t-sky-500/80",
  },
  {
    status: "interview",
    label: "Interview",
    accentClass: "border-t-amber-400/80",
  },
  {
    status: "offer",
    label: "Offer",
    accentClass: "border-t-emerald-400/80",
  },
  {
    status: "rejected",
    label: "Rejected",
    accentClass: "border-t-rose-500/80",
  },
];

export default function HomePage() {
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const {
    currentUser,
    isLoading,
    boards,
    applications,
    commentsByApplication,
    createBoard,
    joinBoardByInviteCode,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    addComment,
  } = useInternshipTracker(selectedBoardId || undefined);

  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinMessage, setJoinMessage] = useState("");

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    if (!selectedBoardId && boards.length > 0) {
      setSelectedBoardId(boards[0].recordId);
    }
  }, [boards, selectedBoardId]);

  const activeBoard =
    boards.find((b) => b.recordId === selectedBoardId) ?? boards[0] ?? null;
  const activeBoardId = activeBoard?.recordId ?? "";

  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();
    const cleanTitle = newBoardTitle.trim();
    if (!cleanTitle) return;
    const created: unknown = await createBoard(cleanTitle);
    setNewBoardTitle("");

    const candidate =
      typeof created === "object" && created !== null
        ? (created as Record<string, unknown>)
        : null;
    const nested =
      candidate &&
      typeof candidate.record === "object" &&
      candidate.record !== null
        ? (candidate.record as Record<string, unknown>)
        : null;

    const rawId =
      candidate?.recordId ??
      candidate?.id ??
      nested?.recordId ??
      nested?.id;

    if (typeof rawId === "string" && rawId.length > 0) {
      setSelectedBoardId(rawId);
    }
  }

  async function handleJoinBoard(e: FormEvent) {
    e.preventDefault();
    setJoinMessage("");
    const joinedId = await joinBoardByInviteCode(inviteCodeInput);
    if (joinedId) {
      setSelectedBoardId(joinedId);
      setInviteCodeInput("");
      setJoinMessage("Joined shared board.");
    } else {
      setJoinMessage("No matching invite code found.");
    }
  }

  async function handleCreateApplication(e: FormEvent) {
    e.preventDefault();
    if (!activeBoardId || !company.trim() || !role.trim()) return;
    await createApplication({
      boardId: activeBoardId,
      company,
      role,
      status,
      deadline,
      notes,
    });
    setCompany("");
    setRole("");
    setDeadline("");
    setNotes("");
    setStatus("applied");
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!activeBoardId || !selectedAppId || !commentDraft.trim()) return;
    await addComment(activeBoardId, selectedAppId, commentDraft);
    setCommentDraft("");
  }

  const selectedApp =
    applications.find((a) => a.recordId === selectedAppId) ?? null;
  const selectedComments = selectedApp
    ? commentsByApplication.get(selectedApp.recordId) ?? []
    : [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Stryker Intern Pulse
              </h1>
              {activeBoard && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Invite: {activeBoard.data.inviteCode}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {currentUser?.name ?? currentUser?.email ?? "Teammate"} · Real-time
              shared internship pipeline
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {boards.length > 0 && (
              <select
                aria-label="Active board"
                value={activeBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
              >
                {boards.map((board) => (
                  <option key={board.recordId} value={board.recordId}>
                    {board.data.title}
                  </option>
                ))}
              </select>
            )}

            <form onSubmit={handleCreateBoard} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="New board title..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 w-40 focus:outline-none focus:border-neutral-500"
              />
              <button
                type="submit"
                className="bg-white text-neutral-950 hover:bg-neutral-200 transition rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                New Board
              </button>
            </form>

            <form onSubmit={handleJoinBoard} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Invite code"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 w-28 font-mono uppercase focus:outline-none focus:border-neutral-500"
              />
              <button
                type="submit"
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-100"
              >
                Join
              </button>
            </form>
          </div>
        </header>

        {joinMessage && (
          <div className="text-sm text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2">
            {joinMessage}
          </div>
        )}

        {!activeBoard ? (
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-10 text-center space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Create or join an internship board
            </h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Start a board above to track applications, deadlines, notes, and
              interview comments with teammates in real time.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLUMNS.map((col) => {
                const count = applications.filter(
                  (app) => app.data.status === col.status
                ).length;
                return (
                  <div
                    key={col.status}
                    className={`bg-neutral-900/80 border border-neutral-800 border-t-2 ${col.accentClass} rounded-xl px-4 py-3 flex items-center justify-between`}
                  >
                    <span className="text-sm font-medium text-neutral-300">
                      {col.label}
                    </span>
                    <span className="text-lg font-bold text-white">{count}</span>
                  </div>
                );
              })}
            </section>

            <section className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-neutral-200 mb-3">
                Add Internship Application
              </h2>
              <form
                onSubmit={handleCreateApplication}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5"
              >
                <input
                  type="text"
                  required
                  placeholder="Company (e.g., Stripe)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <input
                  type="text"
                  required
                  placeholder="Role (e.g., SWE Intern)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <select
                  aria-label="Status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ApplicationStatus)
                  }
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
                >
                  {COLUMNS.map((col) => (
                    <option key={col.status} value={col.status}>
                      {col.label}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  aria-label="Deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
                />
                <input
                  type="text"
                  placeholder="Notes, portal link, referral..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-neutral-950 transition rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  + Add Card
                </button>
              </form>
            </section>

            {isLoading ? (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 text-center text-sm text-neutral-400">
                Syncing applications...
              </div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {COLUMNS.map((col) => {
                  const items = applications.filter(
                    (app) => app.data.status === col.status
                  );
                  return (
                    <div
                      key={col.status}
                      className={`bg-neutral-900/70 border border-neutral-800 border-t-2 ${col.accentClass} rounded-xl p-3.5 space-y-3 min-h-[360px]`}
                    >
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-semibold text-white">
                          {col.label}
                        </h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {items.map((app) => {
                          const commentCount = (
                            commentsByApplication.get(app.recordId) ?? []
                          ).length;
                          const isSelected = selectedAppId === app.recordId;
                          return (
                            <article
                              key={app.recordId}
                              className={`bg-neutral-950/90 border rounded-lg p-3.5 space-y-2.5 transition ${
                                isSelected
                                  ? "border-sky-500/70"
                                  : "border-neutral-800 hover:border-neutral-700"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-semibold text-sm text-white">
                                    {app.data.company}
                                  </div>
                                  <div className="text-xs text-neutral-400">
                                    {app.data.role}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteApplication(app.recordId)}
                                  className="text-xs text-neutral-500 hover:text-rose-400 transition"
                                >
                                  Remove
                                </button>
                              </div>

                              {app.data.deadline && (
                                <div className="text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 inline-block">
                                  Due {app.data.deadline}
                                </div>
                              )}

                              {app.data.notes && (
                                <p className="text-xs text-neutral-300 leading-relaxed break-words">
                                  {app.data.notes}
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/80">
                                <select
                                  aria-label={`Move ${app.data.company} status`}
                                  value={app.data.status}
                                  onChange={(e) =>
                                    updateApplicationStatus(
                                      app.recordId,
                                      e.target.value as ApplicationStatus
                                    )
                                  }
                                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
                                >
                                  {COLUMNS.map((opt) => (
                                    <option key={opt.status} value={opt.status}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => setSelectedAppId(app.recordId)}
                                  className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
                                >
                                  Comments ({commentCount})
                                </button>
                              </div>

                              <div className="text-[11px] text-neutral-500">
                                Updated by {app.data.updatedBy}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {selectedApp && (
              <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {selectedApp.data.company} — {selectedApp.data.role}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Live team comments &amp; interview notes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAppId(null)}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg px-3 py-1.5 transition"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedComments.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-2">
                      No comments yet. Add prep notes, OA details, or updates.
                    </p>
                  ) : (
                    selectedComments.map((comment) => (
                      <div
                        key={comment.recordId}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span className="font-semibold text-neutral-200">
                            {comment.data.authorName}
                          </span>
                          <span>
                            {new Date(comment.data.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 break-words">
                          {comment.data.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 flex-1 focus:outline-none focus:border-neutral-600"
                  />
                  <button
                    type="submit"
                    className="bg-white text-neutral-950 hover:bg-neutral-200 transition rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    Post
                  </button>
                </form>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}