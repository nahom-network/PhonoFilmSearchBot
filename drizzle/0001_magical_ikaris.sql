PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movie_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`details` text NOT NULL,
	`created_at` integer DEFAULT 1757005529717 NOT NULL,
	`updated_at` integer DEFAULT 1757005529717 NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_movie_details`("id", "movie_id", "details", "created_at", "updated_at") SELECT "id", "movie_id", "details", "created_at", "updated_at" FROM `movie_details`;--> statement-breakpoint
DROP TABLE `movie_details`;--> statement-breakpoint
ALTER TABLE `__new_movie_details` RENAME TO `movie_details`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `movie_details_movie_id_unique` ON `movie_details` (`movie_id`);--> statement-breakpoint
CREATE TABLE `__new_movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`title` text NOT NULL,
	`year` text NOT NULL,
	`poster` text NOT NULL,
	`type` text NOT NULL,
	`imdb_id` text,
	`imdb_votes` integer DEFAULT 0 NOT NULL,
	`invite_link` text,
	`plot` text,
	`external_id` text NOT NULL,
	`created_at` integer DEFAULT 1757005529716 NOT NULL,
	`updated_at` integer DEFAULT 1757005529717 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_movies`("id", "tmdb_id", "title", "year", "poster", "type", "imdb_id", "imdb_votes", "invite_link", "plot", "external_id", "created_at", "updated_at") SELECT "id", "tmdb_id", "title", "year", "poster", "type", "imdb_id", "imdb_votes", "invite_link", "plot", "external_id", "created_at", "updated_at" FROM `movies`;--> statement-breakpoint
DROP TABLE `movies`;--> statement-breakpoint
ALTER TABLE `__new_movies` RENAME TO `movies`;--> statement-breakpoint
CREATE UNIQUE INDEX `movies_tmdb_id_unique` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `__new_user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`presentation_mode` text DEFAULT 'quality_first' NOT NULL,
	`created_at` integer DEFAULT 1757005529715 NOT NULL,
	`updated_at` integer DEFAULT 1757005529715 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_settings`("id", "user_id", "presentation_mode", "created_at", "updated_at") SELECT "id", "user_id", "presentation_mode", "created_at", "updated_at" FROM `user_settings`;--> statement-breakpoint
DROP TABLE `user_settings`;--> statement-breakpoint
ALTER TABLE `__new_user_settings` RENAME TO `user_settings`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);