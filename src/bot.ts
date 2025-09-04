import { Telegraf } from "telegraf";
import { handleInlineQuery } from "./routes/inlineQueryRoute.js";
import { config } from "dotenv";
import { start, handleMovieSelection, handleDownloadSelection, handleSettings, handleSettingSelection } from "./routes/commandRoute.js";
import { initializeDatabase } from "./services/databaseService.js";

config()

const BOT_TOKEN = process.env.BOT_TOKEN as string
console.log("Starting bot with token:", BOT_TOKEN ? "Token found" : "No token found");

// Initialize database
await initializeDatabase();

const bot = new Telegraf(BOT_TOKEN);

// bot initiated
console.log("Bot initiated")

bot.on("inline_query", handleInlineQuery);
bot.start(start);
bot.command("settings", handleSettings);
bot.command("help", start);
bot.action(/^movie_/, handleMovieSelection);
bot.action(/^download_/, handleDownloadSelection);
bot.action(/^setting_/, handleSettingSelection);

console.log("Attempting to launch bot...");
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))