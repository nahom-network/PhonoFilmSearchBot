CREATE TABLE `movie_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`details` text NOT NULL,
	`created_at` integer DEFAULT 1757005410915 NOT NULL,
	`updated_at` integer DEFAULT 1757005410915 NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movie_details_movie_id_unique` ON `movie_details` (`movie_id`);--> statement-breakpoint
CREATE TABLE `movies` (
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
	`created_at` integer DEFAULT 1757005410914 NOT NULL,
	`updated_at` integer DEFAULT 1757005410914 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_tmdb_id_unique` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`presentation_mode` text DEFAULT 'quality_first' NOT NULL,
	`created_at` integer DEFAULT 1757005410912 NOT NULL,
	`updated_at` integer DEFAULT 1757005410912 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);