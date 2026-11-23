/** Friend procedures. See docs/SCHEMA_AND_API.md § friends. */

import {
  FriendRequest,
  FriendResponse,
  ProfileIdentity,
} from "@/server/models/inputs";
import { Friend } from "@/server/models/responses";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { notImplemented } from "./_todo";

const getFriends = protectedProcedure.output(Friend.array()).query(notImplemented);

const getPendingRequests = protectedProcedure
  .output(Friend.array())
  .query(notImplemented);

const sendRequest = protectedProcedure
  .input(FriendRequest)
  .output(Friend)
  .mutation(notImplemented);

const respondToRequest = protectedProcedure
  .input(FriendResponse)
  .mutation(notImplemented);

const removeFriend = protectedProcedure
  .input(ProfileIdentity)
  .mutation(notImplemented);

export const friendsApiRouter = createTRPCRouter({
  getFriends,
  getPendingRequests,
  sendRequest,
  respondToRequest,
  removeFriend,
});
