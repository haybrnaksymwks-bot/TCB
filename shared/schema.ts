import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  defaultStyleId: integer("default_style_id"),
  autoFormat: boolean("auto_format").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const styles = pgTable("styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  topImage: text("top_image"),
  bottomImage: text("bottom_image"),
  decorations: jsonb("decorations").$type<{
    prefix?: string;
    suffix?: string;
    separator?: string;
    emoji?: string;
  }>().default({}).notNull(),
  markdownRules: jsonb("markdown_rules").$type<{
    boldHeaders?: boolean;
    addQuotes?: boolean;
    addLines?: boolean;
  }>().default({}).notNull(),
  signature: text("signature").default("— ✦ بقلم: {author} ✦ —").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  styleId: integer("style_id"),
  topImage: text("top_image"),
  bottomImage: text("bottom_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  allowChange: boolean("allow_change").default(true).notNull(),
  endsAt: timestamp("ends_at"),
  styleId: integer("style_id"),
  topImage: text("top_image"),
  bottomImage: text("bottom_image"),
  createdBy: text("created_by").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  userId: text("user_id").notNull(),
  optionIndex: integer("option_index").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const postedMessages = pgTable("posted_messages", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id"),
  authorId: text("author_id").notNull(),
  previewText: text("preview_text").notNull(),
  finalText: text("final_text").notNull(),
  styleId: integer("style_id"),
  autoFormatUsed: boolean("auto_format_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serverSettings = pgTable("server_settings", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull().unique(),
  newsChannelId: text("news_channel_id"),
  pollChannelId: text("poll_channel_id"),
  logsChannelId: text("logs_channel_id"),
  reportsChannelId: text("reports_channel_id"),
  allowMentions: boolean("allow_mentions").default(true).notNull(),
  imageCount: integer("image_count").default(2).notNull(),
  defaultTopImage: text("default_top_image"),
  defaultBottomImage: text("default_bottom_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStyleSchema = createInsertSchema(styles).omit({ id: true, createdAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true });
export const insertPollSchema = createInsertSchema(polls).omit({ id: true, createdAt: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, timestamp: true });
export const insertPostedMessageSchema = createInsertSchema(postedMessages).omit({ id: true, createdAt: true });
export const insertServerSettingsSchema = createInsertSchema(serverSettings).omit({ id: true, createdAt: true, updatedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Style = typeof styles.$inferSelect;
export type InsertStyle = z.infer<typeof insertStyleSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type PostedMessage = typeof postedMessages.$inferSelect;
export type InsertPostedMessage = z.infer<typeof insertPostedMessageSchema>;
export type ServerSettings = typeof serverSettings.$inferSelect;
export type InsertServerSettings = z.infer<typeof insertServerSettingsSchema>;
