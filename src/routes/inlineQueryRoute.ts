import { Context } from "telegraf";
import type {
  InlineQueryResultArticle,
  InputTextMessageContent,
  InlineQueryResultPhoto,
} from "telegraf/types";
import { searchT4tsa } from "../services/t4tsaService";

export async function handleInlineQuery(ctx: Context) {
  const query = ctx.inlineQuery?.query;
  if (!query) return;

  try {
    const results = await searchT4tsa(query);

    // Map results to inline articles with poster images
    const inlineResults: (InlineQueryResultArticle | InlineQueryResultPhoto)[] =
      results.map((item, index) => {
        if (item.invite_link) {
          // If there is an invite link, make it an article with link
          return {
            type: "article",
            id: item._id,
            title: `${item.title} (${item.year})`,
            description: item.type,
            input_message_content: {
              message_text: `🎬 ${item.title} (${item.year})\nType: ${
                item.type
              }\nLink: ${item.invite_link}\nPlot: ${item.plot || "N/A"}`,
            } as InputTextMessageContent,
            thumb_url: item.poster,
          };
        } else {
          // If no link, show as photo inline with callback data for selection
          return {
            type: "photo",
            id: item._id,
            photo_url: item.poster,
            thumb_url: item.poster,
            thumbnail_url: item.poster,
            caption: `🎬 ${item.title} (${item.year})\nType: ${
              item.type
            }\nPlot: ${item.plot || "N/A"}\nLink: https://t4tsa.cc/movie/${
              item.tmdb_id
            }`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📋 Get Details",
                    callback_data: `movie_${item.tmdb_id}`,
                  },
                ],
              ],
            },
          };
        }
      });

    ctx.answerInlineQuery(inlineResults, { cache_time: 0 });
  } catch (err) {
    console.error("Inline query error:", err);
  }
}
