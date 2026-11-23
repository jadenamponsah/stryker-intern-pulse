import { useEffect, useState, type FormEvent } from "react";
import { useInternshipTracker } from "@/hooks/(app)/useInternshipTracker";
import type { ApplicationStatus } from "@/schemas/internship-schema";

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "applied", label: "Applied" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

export default function InternshipsPage() {
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
      candidate && typeof candidate.record === "object" && candidate.record !== null
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
      setJoinMessage("Joined board.");
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Shared Internship Tracker</h1>
          <p className="text-sm text-neutral-600">
            Signed in as {currentUser?.name ?? currentUser?.email ?? "Member"}{" "}
            · Live updates enabled
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Select board"
            value={activeBoardId}
            onChange={(e) => setSelectedBoardId(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            {boards.map((board) => (
              <option key={board.recordId} value={board.recordId}>
                {board.data.title} (Code: {board.data.inviteCode})
              </option>
            ))}
          </select>

          <form onSubmit={handleCreateBoard} className="flex gap-1.5">
            <input
              type="text"
              placeholder="New board name"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="border rounded px-2.5 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="border rounded px-3 py-1.5 text-sm font-medium"
            >
              Create Board
            </button>
          </form>

          <form onSubmit={handleJoinBoard} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Invite code"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              className="border rounded px-2.5 py-1.5 text-sm w-28"
            />
            <button
              type="submit"
              className="border rounded px-3 py-1.5 text-sm font-medium"
            >
              Join
            </button>
          </form>
        </div>
      </header>

      {joinMessage && <p className="text-sm text-neutral-700">{joinMessage}</p>}

      {!activeBoard ? (
        <div className="border rounded p-6 text-center space-y-2">
          <p className="font-medium">No board selected yet.</p>
          <p className="text-sm text-neutral-600">
            Create a board above or enter a teammate&apos;s invite code to start
            tracking internships together.
          </p>
        </div>
      ) : (
        <>
          <section className="border rounded p-4">
            <h2 className="font-semibold mb-3">
              Add Application to &ldquo;{activeBoard.data.title}&rdquo; (Invite
              Code: <span className="font-mono">{activeBoard.data.inviteCode}</span>
              )
            </h2>
            <form
              onSubmit={handleCreateApplication}
              className="grid grid-cols-1 md:grid-cols-6 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
              <select
                aria-label="Application status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="border rounded px-3 py-2 text-sm"
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
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Notes (OA link, recruiter, prep)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="border rounded px-3 py-2 text-sm font-semibold"
              >
                Add Application
              </button>
            </form>
          </section>

          {isLoading ? (
            <p className="text-sm text-neutral-600">Loading live board...</p>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {COLUMNS.map((col) => {
                const items = applications.filter(
                  (app) => app.data.status === col.status
                );
                return (
                  <div
                    key={col.status}
                    className="border rounded p-3 space-y-3 min-h-[320px]"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-semibold">{col.label}</h3>
                      <span className="text-xs px-2 py-0.5 border rounded">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {items.map((app) => {
                        const commentCount = (
                          commentsByApplication.get(app.recordId) ?? []
                        ).length;
                        return (
                          <article
                            key={app.recordId}
                            className="border rounded p-3 space-y-2 text-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">
                                  {app.data.company}
                                </div>
                                <div className="text-neutral-700">
                                  {app.data.role}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteApplication(app.recordId)}
                                className="text-xs text-neutral-500 hover:text-black"
                              >
                                Delete
                              </button>
                            </div>

                            {app.data.deadline && (
                              <div className="text-xs text-neutral-600">
                                Deadline: {app.data.deadline}
                              </div>
                            )}

                            {app.data.notes && (
                              <p className="text-xs text-neutral-700 break-words">
                                {app.data.notes}
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <select
                                aria-label={`Status for ${app.data.company}`}
                                value={app.data.status}
                                onChange={(e) =>
                                  updateApplicationStatus(
                                    app.recordId,
                                    e.target.value as ApplicationStatus
                                  )
                                }
                                className="border rounded px-2 py-1 text-xs"
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
                                className="text-xs underline font-medium"
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
            <section className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold">
                  Comments — {selectedApp.data.company} ({selectedApp.data.role}
                  )
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedAppId(null)}
                  className="text-xs border rounded px-2.5 py-1"
                >
                  Close Thread
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedComments.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No comments yet. Start the thread below.
                  </p>
                ) : (
                  selectedComments.map((comment) => (
                    <div
                      key={comment.recordId}
                      className="border rounded p-2.5 text-sm space-y-1"
                    >
                      <div className="flex justify-between text-xs text-neutral-600">
                        <span className="font-semibold">
                          {comment.data.authorName}
                        </span>
                        <span>
                          {new Date(comment.data.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-neutral-800 break-words">
                        {comment.data.body}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add an update, interview tip, or question..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  className="border rounded px-3 py-2 text-sm flex-1"
                />
                <button
                  type="submit"
                  className="border rounded px-4 py-2 text-sm font-medium"
                >
                  Post Comment
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </div>
  );
}