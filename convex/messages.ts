import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("messages").order("desc").take(100);
    const messagesWithLikes = await Promise.all(
      messages.map(async (message) => {
        const likes = await ctx.db
        .query("likes")
        .withIndex("byMessageId", (q) => q.eq("messageId", message._id))
        .collect();
        return {
          ...message,
          likes: likes.length,
          body: message.body.replaceAll(":)", "🙂"),
        };
      }),
    );

    // Reverse the list so that it's in a chronological order.
    return messagesWithLikes.reverse();
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    // Send a new message.
    await ctx.db.insert("messages", {
      body: args.body,
      author: args.author,
    });
  },
});

export const like = mutation({
  args: { messageId: v.id("messages"), liker: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("likes", {
      messageId: args.messageId,
      liker: args.liker,
    });
  },
});
