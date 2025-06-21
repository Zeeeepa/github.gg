import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, createTRPCRouter } from "../router";

export const githubRouterMinimal = createTRPCRouter({
  // Simple test procedure
  test: publicProcedure
    .input(z.object({
      message: z.string(),
    }))
    .query(async ({ input }) => {
      return {
        success: true,
        message: `Hello ${input.message}`,
      };
    }),
});
