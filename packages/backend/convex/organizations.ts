import { v } from "convex/values";
import { components } from "./_generated/api";
import { query } from "./_generated/server";

export const listMembers = query({
  args: {
    organizationId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      organizationId: v.string(),
      userId: v.string(),
      role: v.string(),
      createdAt: v.number(),
      user: v.union(
        v.null(),
        v.object({
          _id: v.string(),
          // userId: v.union(v.null(), v.string()),
          name: v.string(),
          email: v.string(),
          // emailVerified: v.boolean(),
          // image: v.union(v.null(), v.string()),
          // createdAt: v.number(),
          // updatedAt: v.number(),
          // twoFactorEnabled: v.union(v.null(), v.boolean()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const membersResult = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "member",
        where: [
          {
            field: "organizationId",
            value: args.organizationId,
            operator: "eq",
          },
        ],
        paginationOpts: {
          numItems: 1000,
          cursor: null,
        },
      }
    );

    // Handle paginated result - could be { page: [...], isDone: boolean, continueCursor: ... } or just an array
    const members = Array.isArray(membersResult)
      ? membersResult
      : (membersResult as { page?: unknown[] })?.page || [];

    const userIds = members.map(
      (m: {
        _id: string;
        organizationId: string;
        userId: string;
        role: string;
        createdAt: number;
      }) => m.userId
    );

    if (userIds.length === 0) {
      return [];
    }

    // const usersResult = await ctx.runQuery(
    //   components.betterAuth.adapter.findMany,
    //   {
    //     model: "user",
    //     where: [
    //       {
    //         field: "userId",
    //         value: userIds,
    //         operator: "in",
    //       },
    //     ],
    //     paginationOpts: {
    //       numItems: 1000,
    //       cursor: null,
    //     },
    //   }
    // );

    const usersResult = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "user",
        where: [
          {
            field: "_id",
            operator: "in",
            value: userIds,
          },
        ],
        paginationOpts: {
          numItems: 1000,
          cursor: null,
        },
      }
    );

    // Handle paginated result
    const users = Array.isArray(usersResult)
      ? usersResult
      : (usersResult as { page?: unknown[] })?.page || [];

    const usersById = new Map(
      users.map(
        (u: {
          _id: string;
          // userId: string | null;
          name: string;
          email: string;
          // emailVerified: boolean;
          // image: string | null;
          // createdAt: number;
          // updatedAt: number;
          // twoFactorEnabled: boolean | null;
        }) => [u._id, u]
      )
    );

    return members.map(
      (m: {
        _id: string;
        organizationId: string;
        userId: string;
        role: string;
        createdAt: number;
      }) => {
        const user = usersById.get(m.userId);
        return {
          _id: m._id,
          organizationId: m.organizationId,
          userId: m.userId,
          role: m.role,
          createdAt: m.createdAt,
          user: user
            ? {
                _id: user._id,
                // userId: user.userId,
                name: user.name,
                email: user.email || "",
                // emailVerified: user.emailVerified,
                // image: user.image || null,
                // createdAt: user.createdAt,
                // updatedAt: user.updatedAt,
                // twoFactorEnabled: user.twoFactorEnabled || null,
              }
            : null,
        };
      }
    );
  },
});

export const listInvitations = query({
  args: {
    organizationId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      organizationId: v.string(),
      email: v.string(),
      role: v.union(v.null(), v.string()),
      status: v.string(),
      expiresAt: v.number(),
      inviterId: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const invitationsResult = await ctx.runQuery(
      components.betterAuth.adapter.findMany,
      {
        model: "invitation",
        where: [
          {
            field: "organizationId",
            value: args.organizationId,
            operator: "eq",
          },
          {
            field: "status",
            value: "pending",
            operator: "eq",
          },
        ],
        paginationOpts: {
          numItems: 1000,
          cursor: null,
        },
      }
    );

    // Handle paginated result
    const invitations = Array.isArray(invitationsResult)
      ? invitationsResult
      : (invitationsResult as { page?: unknown[] })?.page || [];

    return invitations.map(
      (inv: {
        _id: string;
        organizationId: string;
        email: string;
        role?: string | null;
        status: string;
        expiresAt: number;
        inviterId: string;
        createdAt?: number;
      }) => ({
        _id: inv._id,
        organizationId: inv.organizationId,
        email: inv.email,
        role: inv.role || null,
        status: inv.status,
        expiresAt: inv.expiresAt,
        inviterId: inv.inviterId,
        createdAt: inv.createdAt || Date.now(),
      })
    );
  },
});
