import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL_NAME = "meta-llama/Llama-3-8b-chat-hf";
const SYSTEM_PROMPT = "You are a terse bot in a group chat responding to questions with 1-sentence answers.";
export const AUTHOR_NAME_AI = "AI";

export const chat = action({
  args: {
      messageBody: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: args.messageBody,
            },
          ],
        }),
      }
    );

    const json = await response.json();
    const messageContent = json.choices[0].message?.content;
    
    await ctx.runMutation(api.messages.send, {
      author: AUTHOR_NAME_AI,
      body: messageContent || "Sorry, I don't have an answer for that.",
    });
  },
});