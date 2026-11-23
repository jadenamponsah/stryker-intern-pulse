import { useMemo } from "react";
import { useMutations, useQuery, useUser } from "deepspace";
import type {
  ApplicationCommentRecord,
  ApplicationStatus,
  InternshipApplicationRecord,
  InternshipBoardRecord,
} from "@/schemas/internship-schema";

export interface NewApplicationInput {
  boardId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  deadline: string;
  notes: string;
}

export function useInternshipTracker(activeBoardId?: string) {
  const { user } = useUser();

  const boardsQuery = useQuery<InternshipBoardRecord>("boards");
  const appsQuery = useQuery<InternshipApplicationRecord>("applications");
  const commentsQuery = useQuery<ApplicationCommentRecord>("comments");

  const boardMutations = useMutations<InternshipBoardRecord>("boards");
  const appMutations = useMutations<InternshipApplicationRecord>("applications");
  const commentMutations = useMutations<ApplicationCommentRecord>("comments");

  const actorId = user?.id ?? "anonymous";
  const actorName = user?.name ?? user?.email ?? "Teammate";

  const accessibleBoards = useMemo(() => {
    const all = boardsQuery.records ?? [];
    if (!user?.id) return all;
    return all.filter((b) => {
      const members = Array.isArray(b.data.memberIds) ? b.data.memberIds : [];
      return b.data.ownerId === user.id || members.includes(user.id);
    });
  }, [boardsQuery.records, user?.id]);

  const boardApplications = useMemo(() => {
    const all = appsQuery.records ?? [];
    if (!activeBoardId) return [];
    return all
      .filter((item) => item.data.boardId === activeBoardId)
      .sort((a, b) =>
        (a.data.deadline || "9999-12-31").localeCompare(
          b.data.deadline || "9999-12-31"
        )
      );
  }, [appsQuery.records, activeBoardId]);

  const commentsByApplication = useMemo(() => {
    const map = new Map<string, typeof commentsQuery.records>();
    for (const comment of commentsQuery.records ?? []) {
      if (activeBoardId && comment.data.boardId !== activeBoardId) continue;
      const existing = map.get(comment.data.applicationId) ?? [];
      existing.push(comment);
      map.set(comment.data.applicationId, existing);
    }
    for (const [key, list] of map.entries()) {
      map.set(
        key,
        [...list].sort((a, b) =>
          a.data.createdAt.localeCompare(b.data.createdAt)
        )
      );
    }
    return map;
  }, [commentsQuery.records, activeBoardId]);

  async function createBoard(title: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle) return null;
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    return boardMutations.create({
      title: cleanTitle,
      inviteCode,
      ownerId: actorId,
      memberIds: actorId !== "anonymous" ? [actorId] : [],
      createdAt: new Date().toISOString(),
    });
  }

  async function joinBoardByInviteCode(inviteCode: string) {
    const normalized = inviteCode.trim().toUpperCase();
    if (!normalized || actorId === "anonymous") return null;
    const target = (boardsQuery.records ?? []).find(
      (b) => b.data.inviteCode.toUpperCase() === normalized
    );
    if (!target) return null;

    const currentMembers = Array.isArray(target.data.memberIds)
      ? target.data.memberIds
      : [];
    if (!currentMembers.includes(actorId)) {
      await boardMutations.put(target.recordId, {
        memberIds: [...currentMembers, actorId],
      });
    }
    return target.recordId;
  }

  async function createApplication(input: NewApplicationInput) {
    return appMutations.create({
      ...input,
      company: input.company.trim(),
      role: input.role.trim(),
      notes: input.notes.trim(),
      updatedBy: actorName,
      updatedAt: new Date().toISOString(),
    });
  }

  async function updateApplicationStatus(
    recordId: string,
    status: ApplicationStatus
  ) {
    return appMutations.put(recordId, {
      status,
      updatedBy: actorName,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteApplication(recordId: string) {
    return appMutations.remove(recordId);
  }

  async function addComment(
    boardId: string,
    applicationId: string,
    body: string
  ) {
    const cleanBody = body.trim();
    if (!cleanBody) return null;
    return commentMutations.create({
      boardId,
      applicationId,
      authorId: actorId,
      authorName: actorName,
      body: cleanBody,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    currentUser: user,
    isLoading:
      boardsQuery.status === "loading" ||
      appsQuery.status === "loading" ||
      commentsQuery.status === "loading",
    boards: accessibleBoards,
    applications: boardApplications,
    commentsByApplication,
    createBoard,
    joinBoardByInviteCode,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    addComment,
  };
}