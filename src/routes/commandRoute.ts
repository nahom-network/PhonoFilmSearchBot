import { Context } from "telegraf";
import { getMovieDetails } from "../services/t4tsaService.js";
import {
  getUserSettings,
  updateUserSettings,
} from "../services/databaseService.js";

export async function start(ctx: Context) {
  const botUserame = ctx.me;

  const welcomeMessage = `🎬 *Welcome to Movie Search Bot!*

🔍 *How to use:*
• Search: Type \`@${botUserame} movie_title\` in any chat
• Get details: Click "📋 Get Details" on any result

⚙️ *Settings:*
• \`/settings\` - Change presentation mode
• \`/help\` - Show this help message

Choose your preferred way to view movie downloads!`;

  await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
}

export async function handleSettings(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📊 Quality First", callback_data: "setting_quality_first" },
        { text: "📋 All Files", callback_data: "setting_all_files" },
      ],
      [{ text: "❌ Cancel", callback_data: "setting_cancel" }],
    ],
  };

  await ctx.reply(
    "⚙️ *Choose Presentation Mode:*\n\n• **Quality First**: Show qualities first, then files\n• **All Files**: Show all files directly",
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
}

export async function handleSettingSelection(ctx: Context) {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery || !("data" in callbackQuery)) return;

  const callbackData = callbackQuery.data;
  if (!callbackData || !callbackData.startsWith("setting_")) return;

  const userId = ctx.from?.id;
  if (!userId) return;

  const setting = callbackData.replace("setting_", "");

  if (setting === "cancel") {
    await ctx.editMessageText("❌ Settings cancelled");
    return;
  }

  await updateUserSettings(userId, setting);
  await ctx.editMessageText(
    `✅ Presentation mode updated to: **${
      setting === "quality_first" ? "Quality First" : "All Files"
    }**`,
    {
      parse_mode: "Markdown",
    }
  );
}

export async function handleMovieSelection(ctx: Context) {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery || !("data" in callbackQuery)) return;

  const callbackData = callbackQuery.data;
  if (!callbackData || !callbackData.startsWith("movie_")) return;

  const tmdbId = parseInt(callbackData.replace("movie_", ""));
  const userId = ctx.from?.id;

  try {
    const movieDetails = await getMovieDetails(tmdbId);
    const { details } = movieDetails;

    // Get user settings
    const settings = await getUserSettings(userId || 0);

    if (settings.presentationMode === "all_files") {
      await showAllFiles(ctx, movieDetails, details);
    } else {
      await showQualityFirst(ctx, movieDetails, details);
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
    await ctx.answerCbQuery("❌ Failed to fetch movie details");
  }
}

async function showAllFiles(ctx: Context, movieDetails: any, details: any) {
  const qualities = [
    "2160p",
    "1440p",
    "1080p",
    "720p",
    "480p",
    "360p",
  ] as const;
  const allFiles: any[] = [];

  // Collect all files
  for (const quality of qualities) {
    const files = movieDetails[quality];
    if (files && files.length > 0) {
      allFiles.push(...files.map((file: any) => ({ ...file, quality })));
    }
  }

  if (allFiles.length === 0) {
    await ctx.editMessageText("❌ No download files available for this movie");
    return;
  }

  // Create keyboard with all files
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "📺 Get Online",
          url: `https://t4tsa.cc/movie/${details.tmdb_id}`,
        },
      ],
      ...allFiles.map((file, index) => [
        {
          text: `📁 ${file.quality} - ${file.file_name.substring(0, 25)}... (${(
            file.file_size /
            1024 /
            1024
          ).toFixed(1)}MB)`,
          url: `t.me/Phonofilmbot?start=${file.message_id}`,
        },
      ]),
    ],
  };

  const message = `🎬 *${details.title}* (${details.year})

📥 *All Available Downloads (${allFiles.length} files):*
${allFiles
  .map(
    (file, index) =>
      `${index + 1}. **${file.quality}** - ${(
        file.file_size /
        1024 /
        1024
      ).toFixed(1)}MB`
  )
  .join("\n")}

Click any file to download directly!`;

  await ctx.editMessageText(message, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
}

async function showQualityFirst(ctx: Context, movieDetails: any, details: any) {
  // Create keyboard with download options
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "📺 Watch Online",
          url: `https://t4tsa.cc/movie/${details.tmdb_id}`,
        },
      ],
    ],
  };

  // Add download buttons for available qualities
  const qualities = [
    "2160p",
    "1440p",
    "1080p",
    "720p",
    "480p",
    "360p",
  ] as const;
  const downloadButtons = [];

  for (const quality of qualities) {
    const files = movieDetails[quality];
    if (files && files.length > 0) {
      downloadButtons.push({
        text: `📥 ${quality} (${files.length})`,
        callback_data: `download_${details.tmdb_id}_${quality}`,
      });
    }
  }

  // Add download buttons in rows of 2
  if (downloadButtons.length > 0) {
    for (let i = 0; i < downloadButtons.length; i += 2) {
      const row = downloadButtons.slice(i, i + 2);
      keyboard.inline_keyboard.push(row as any);
    }
  }

  const message = `🎬 *${details.title}* (${details.year})

📊 *Available Downloads:*
${qualities
  .map((q) => {
    const files = movieDetails[q];
    return files && files.length > 0
      ? `• ${q}: ${files.length} file${files.length > 1 ? "s" : ""}`
      : null;
  })
  .filter(Boolean)
  .join("\n")}

🎯 *Best Quality:* ${
    qualities.find((q) => movieDetails[q]?.length > 0) || "N/A"
  }`;

  await ctx.editMessageText(message, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
}

export async function handleDownloadSelection(ctx: Context) {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery || !("data" in callbackQuery)) return;

  const callbackData = callbackQuery.data;
  if (!callbackData || !callbackData.startsWith("download_")) return;

  const [, tmdbId, quality] = callbackData.split("_");

  if (!tmdbId || !quality) {
    await ctx.answerCbQuery("❌ Invalid download request");
    return;
  }

  try {
    const movieDetails = await getMovieDetails(parseInt(tmdbId));
    const files = movieDetails[quality as keyof typeof movieDetails] as any[];

    if (!files || files.length === 0) {
      await ctx.answerCbQuery("❌ No files available for this quality");
      return;
    }

    // Create keyboard with individual file options
    const keyboard = {
      inline_keyboard: files.map((file, index) => [
        {
          text: `📁 ${file.file_name.substring(0, 30)}... (${(
            file.file_size /
            1024 /
            1024
          ).toFixed(1)}MB)`,
          url: `t.me/Phonofilmbot?start=${file.message_id}`,
        },
      ]),
    };

    const message = `📥 *Download Options for ${quality}*

Select a file to download:`;

    await ctx.editMessageText(message, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error("Error fetching download options:", error);
    await ctx.answerCbQuery("❌ Failed to fetch download options");
  }
}
