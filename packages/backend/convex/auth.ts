import { expo } from "@better-auth/expo";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { organization, twoFactor } from "better-auth/plugins";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const nativeAppUrl = process.env.NATIVE_APP_URL || "mybettertapp://";
const expoWebUrl = process.env.EXPO_WEB_URL || "http://localhost:8081";

import authSchema from "./betterAuth/schema";

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
);

function createAuth(
  ctx: GenericCtx<DataModel>,
  { optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false }
) {
  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    trustedOrigins: [siteUrl, nativeAppUrl, expoWebUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    // socialProviders: {
    //   google: {
    //     clientId: process.env.GOOGLE_CLIENT_ID || "",
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    //   },
    // },
    plugins: [
      expo(),
      convex(),
      organization(),
      twoFactor(),
      crossDomain({ siteUrl: expoWebUrl }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  async handler(ctx, _args) {
    return await authComponent.getAuthUser(
      ctx as unknown as GenericCtx<DataModel>
    );
  },
});
