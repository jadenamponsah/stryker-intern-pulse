import type { CollectionSchema } from "deepspace/schema";

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";

export interface InternshipBoardRecord {
  title: string;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface InternshipApplicationRecord {
  boardId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  deadline: string;
  notes: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ApplicationCommentRecord {
  boardId: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export const boardsSchema: CollectionSchema = {
  name: "boards",
  columns: [
    { name: "title", storage: "text", interpretation: "plain" },
    { name: "inviteCode", storage: "text", interpretation: "plain" },
    { name: "ownerId", storage: "text", interpretation: "plain" },
    { name: "memberIds", storage: "text", interpretation: "plain" },
    { name: "createdAt", storage: "text", interpretation: "plain" },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: true, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
};

export const applicationsSchema: CollectionSchema = {
  name: "applications",
  columns: [
    { name: "boardId", storage: "text", interpretation: "plain" },
    { name: "company", storage: "text", interpretation: "plain" },
    { name: "role", storage: "text", interpretation: "plain" },
    { name: "status", storage: "text", interpretation: "plain" },
    { name: "deadline", storage: "text", interpretation: "plain" },
    { name: "notes", storage: "text", interpretation: "plain" },
    { name: "updatedBy", storage: "text", interpretation: "plain" },
    { name: "updatedAt", storage: "text", interpretation: "plain" },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: true, delete: true },
    admin: { read: true, create: true, update: true, delete: true },
  },
};

export const commentsSchema: CollectionSchema = {
  name: "comments",
  columns: [
    { name: "boardId", storage: "text", interpretation: "plain" },
    { name: "applicationId", storage: "text", interpretation: "plain" },
    { name: "authorId", storage: "text", interpretation: "plain" },
    { name: "authorName", storage: "text", interpretation: "plain" },
    { name: "body", storage: "text", interpretation: "plain" },
    { name: "createdAt", storage: "text", interpretation: "plain" },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
};