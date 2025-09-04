import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').unique().notNull(),
  presentationMode: text('presentation_mode').notNull().default('quality_first'),
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

export const movies = sqliteTable('movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tmdbId: integer('tmdb_id').unique().notNull(),
  title: text('title').notNull(),
  year: text('year').notNull(),
  poster: text('poster').notNull(),
  type: text('type').notNull(),
  imdbId: text('imdb_id'),
  imdbVotes: integer('imdb_votes').notNull().default(0),
  inviteLink: text('invite_link'),
  plot: text('plot'),
  externalId: text('external_id').notNull(),
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

export const movieDetails = sqliteTable('movie_details', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  movieId: integer('movie_id').unique().notNull().references(() => movies.id, { onDelete: 'cascade' }),
  details: text('details').notNull(), // JSON string of movie details
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
});

// Types for TypeScript
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
export type MovieDetails = typeof movieDetails.$inferSelect;
export type NewMovieDetails = typeof movieDetails.$inferInsert; 