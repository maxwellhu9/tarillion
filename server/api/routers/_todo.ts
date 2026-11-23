import { TRPCError } from "@trpc/server";

/** Placeholder for procedures whose signature is final but body is not yet written. */
export const notImplemented = (): never => {
  throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Not implemented yet." });
};
