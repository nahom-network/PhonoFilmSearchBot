
import { eq, like, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userSettings, movies, movieDetails } from '../db/schema.js';
import type { T4tsaResult, MovieDetails as MovieDetailsType } from '../types/t4tsaTypes.js';

export async function initializeDatabase() {
  try {
    // Test the connection
    await db.select().from(userSettings).limit(1);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function getUserSettings(userId: number) {
  const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return settings[0] || { presentationMode: 'quality_first' };
}

export async function updateUserSettings(userId: number, presentationMode: string) {
  await db.insert(userSettings).values({ userId, presentationMode })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { presentationMode, updatedAt: Date.now() }
    });
}

export async function cacheMovie(movieData: T4tsaResult) {
  const movie = await db.insert(movies).values({
    tmdbId: movieData.tmdb_id || 0,
    title: movieData.title,
    year: movieData.year,
    poster: movieData.poster,
    type: movieData.type,
    imdbId: movieData.imdb_id,
    imdbVotes: movieData.imdb_votes,
    inviteLink: movieData.invite_link,
    plot: movieData.plot,
    externalId: movieData._id
  }).onConflictDoUpdate({
    target: movies.tmdbId,
    set: {
      title: movieData.title,
      year: movieData.year,
      poster: movieData.poster,
      type: movieData.type,
      imdbId: movieData.imdb_id,
      imdbVotes: movieData.imdb_votes,
      inviteLink: movieData.invite_link,
      plot: movieData.plot,
      externalId: movieData._id,
      updatedAt: Date.now()
    }
  }).returning();
  
  return movie[0];
}

export async function cacheMovieDetails(tmdbId: number, details: MovieDetailsType) {
  // First ensure the movie exists
  const movie = await db.select().from(movies).where(eq(movies.tmdbId, tmdbId)).limit(1);
  
  if (!movie[0]) {
    throw new Error(`Movie with TMDB ID ${tmdbId} not found in cache`);
  }

  // Cache the movie details
  await db.insert(movieDetails).values({
    movieId: movie[0].id,
    details: JSON.stringify(details)
  }).onConflictDoUpdate({
    target: movieDetails.movieId,
    set: {
      details: JSON.stringify(details),
      updatedAt: Date.now()
    }
  });
}

export async function getCachedMovie(tmdbId: number): Promise<T4tsaResult | null> {
  const movie = await db.select().from(movies).where(eq(movies.tmdbId, tmdbId)).limit(1);
  
  if (!movie[0]) return null;

  return {
    _id: movie[0].externalId,
    title: movie[0].title,
    year: movie[0].year,
    poster: movie[0].poster,
    type: movie[0].type as "movie" | "series",
    tmdb_id: movie[0].tmdbId,
    imdb_id: movie[0].imdbId || undefined,
    imdb_votes: movie[0].imdbVotes,
    invite_link: movie[0].inviteLink || undefined,
    plot: movie[0].plot || undefined
  } as T4tsaResult;
}

export async function getCachedMovieDetails(tmdbId: number): Promise<MovieDetailsType | null> {
  const result = await db.select({
    details: movieDetails.details
  }).from(movies)
    .innerJoin(movieDetails, eq(movies.id, movieDetails.movieId))
    .where(eq(movies.tmdbId, tmdbId))
    .limit(1);

  if (!result[0]) return null;

  return JSON.parse(result[0].details);
}

export async function searchCachedMovies(query: string): Promise<T4tsaResult[]> {
  const results = await db.select().from(movies)
    .where(
      like(movies.title, `%${query}%`)
    )
    .orderBy(desc(movies.imdbVotes))
    .limit(8);

  return results.map(movie => ({
    _id: movie.externalId,
    title: movie.title,
    year: movie.year,
    poster: movie.poster,
    type: movie.type as "movie" | "series",
    tmdb_id: movie.tmdbId,
    imdb_id: movie.imdbId || undefined,
    imdb_votes: movie.imdbVotes,
    invite_link: movie.inviteLink || undefined,
    plot: movie.plot || undefined
  } as T4tsaResult));
}

export async function cacheSearchResults(results: T4tsaResult[]) {
  // Cache each movie from search results
  for (const movieData of results) {
    await cacheMovie(movieData);
  }
} 