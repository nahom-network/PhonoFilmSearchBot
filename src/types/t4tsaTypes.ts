export interface T4tsaResult {
    _id: string;
    title: string;
    year: string;
    poster: string;
    type: "movie" | "series";
    tmdb_id?: number;
    imdb_id?: string;
    imdb_votes: number;
    invite_link?: string;
    plot?: string;
  }
  
  export type T4tsaResponse = T4tsaResult[];

  export interface MovieFile {
    file_name: string;
    file_size: number;
    message_id: string;
    title: string;
    tmdb_id: number;
    year: string;
  }

  export interface MovieDetails {
    details: {
      tmdb_id: number;
      poster: string;
      title: string;
      year: string;
    };
    top: MovieFile[];
    "2160p": MovieFile[];
    "1440p": MovieFile[];
    "1080p": MovieFile[];
    "720p": MovieFile[];
    "480p": MovieFile[];
    "360p": MovieFile[];
    unsorted: MovieFile[];
    subtitles: any[];
  }
  