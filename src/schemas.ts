/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 *
 * Add schemas by creating a file in src/schemas/ and importing it here.
 */

import { settingsSchema } from "@/schemas/admin-schema";
import { usersSchema } from "@/schemas/users-schema";
import {
  applicationsSchema,
  boardsSchema,
  commentsSchema,
} from "@/schemas/internship-schema";

export const schemas = [
  usersSchema,
  settingsSchema,
  boardsSchema,
  applicationsSchema,
  commentsSchema,
];