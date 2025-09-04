import axios from "axios";
import type { T4tsaResponse, MovieDetails } from "../types/t4tsaTypes";
import {
  getCachedMovieDetails,
  cacheMovieDetails,
  searchCachedMovies,
  cacheSearchResults,
} from "./databaseService.js";
import dotenv from "dotenv";

dotenv.config();

const apiApiUrl = process.env.T4TSA_API_API_URL || "https://api.t4tsa.cc";

const apiApi = axios.create({
  baseURL: apiApiUrl,
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.8",
    "cache-control": "no-cache",
    origin: "https://t4tsa.cc",
    pragma: "no-cache",
    referer: "https://t4tsa.cc/",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  },
});

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Request failed, retrying in ${delay * (i + 1)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Retry failed");
}

export async function searchT4tsa(
  query: string,
  limit = 8
): Promise<T4tsaResponse> {
  // Check cache first
  const cached = await searchCachedMovies(query);
  if (cached && cached.length > 0) {
    console.log(`Using cached search results for: ${query}`);
    return cached;
  }

  const response = await retryRequest(() =>
    apiApi.get<T4tsaResponse>("/search/", {
      params: { limit, q: query, type: "all" },
    })
  );

  // Cache the results
  await cacheSearchResults(response.data);
  console.log(`Cached search results for: ${query}`);

  return response.data;
}

export async function getMovieDetails(tmdbId: number): Promise<MovieDetails> {
  // Check cache first
  const cached = await getCachedMovieDetails(tmdbId);
  if (cached) {
    console.log(`Using cached movie details for TMDB ID: ${tmdbId}`);
    return cached;
  }

  const response = await retryRequest(() =>
    apiApi.get<MovieDetails>("/get-movie/", {
      params: { tmdb_id: tmdbId },
    })
  );

  // Cache the results
  await cacheMovieDetails(tmdbId, response.data);
  console.log(`Cached movie details for TMDB ID: ${tmdbId}`);

  return response.data;
}
