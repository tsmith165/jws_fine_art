CREATE TABLE `Pending` (
	`id` integer PRIMARY KEY NOT NULL,
	`piece_db_id` integer NOT NULL,
	`piece_title` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`international` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `Piece` (
	`id` integer PRIMARY KEY NOT NULL,
	`o_id` integer NOT NULL,
	`class_name` text NOT NULL,
	`title` text NOT NULL,
	`image_path` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`price` integer NOT NULL,
	`sold` integer DEFAULT false,
	`available` integer DEFAULT true,
	`description` text,
	`piece_type` text,
	`instagram` text,
	`real_width` real,
	`real_height` real,
	`active` integer DEFAULT true,
	`theme` text,
	`framed` integer DEFAULT false,
	`comments` text,
	`extra_images` text,
	`progress_images` text
);
--> statement-breakpoint
CREATE TABLE `Verified` (
	`id` integer PRIMARY KEY NOT NULL,
	`piece_db_id` integer NOT NULL,
	`piece_title` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`address` text NOT NULL,
	`international` integer DEFAULT false,
	`image_path` text NOT NULL,
	`image_width` integer NOT NULL,
	`image_height` integer NOT NULL,
	`date` text NOT NULL,
	`stripe_id` text NOT NULL,
	`price` integer NOT NULL
);
