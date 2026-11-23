/**
 * Profile procedures: reading, creating and editing user profiles.
 * See docs/SCHEMA_AND_API.md § profiles.
 */

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { profilesTable } from "@/server/db/schema";
import {
  DraftProfileImage,
  NewUser,
  ProfileHandle,
  ProfileIdentity,
  ProfileSearch,
  ProfileUpdate,
} from "@/server/models/inputs";
import { Profile } from "@/server/models/responses";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { notImplemented } from "./_todo";

/** The signed-in user's profile. */
const getAuthedUserProfile = protectedProcedure
  .output(Profile)
  .query(async ({ ctx }) => {
    const profile = await db.query.profilesTable.findFirst({
      where: { id: ctx.subject.id },
    });
    if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
    return Profile.parse(profile);
  });

/** Called once right after Supabase sign-up to create the profile row. */
const handleNewUser = protectedProcedure
  .input(NewUser)
  .mutation(async ({ ctx, input }) => {
    const taken = await db.query.profilesTable.findFirst({
      where: { handle: input.handle },
    });
    if (taken) {
      throw new TRPCError({ code: "CONFLICT", message: "Handle is taken." });
    }
    await db.insert(profilesTable).values({ id: ctx.subject.id, ...input });
  });

const getProfile = publicProcedure
  .input(ProfileIdentity)
  .output(Profile)
  .query(notImplemented);

const getProfileByHandle = publicProcedure
  .input(ProfileHandle)
  .output(Profile)
  .query(notImplemented);

const updateProfile = protectedProcedure
  .input(ProfileUpdate)
  .output(Profile)
  .mutation(notImplemented);

const updateAvatar = protectedProcedure
  .input(DraftProfileImage)
  .mutation(async ({ ctx, input }) => {
    await db
      .update(profilesTable)
      .set({ avatarUrl: input.avatarUrl })
      .where(eq(profilesTable.id, ctx.subject.id));
  });

const searchProfiles = protectedProcedure
  .input(ProfileSearch)
  .output(Profile.array())
  .query(notImplemented);

export const profilesApiRouter = createTRPCRouter({
  getAuthedUserProfile,
  handleNewUser,
  getProfile,
  getProfileByHandle,
  updateProfile,
  updateAvatar,
  searchProfiles,
});
