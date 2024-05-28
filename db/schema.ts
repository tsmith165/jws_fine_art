import { pgTable, text, integer, real, date, boolean, serial } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const piecesTable = pgTable('Pieces', {
    id: serial('id').notNull().primaryKey(),
    o_id: integer('o_id').notNull(),
    p_id: integer('p_id').notNull().default(0),
    class_name: text('class_name').notNull(),
    title: text('title').notNull(),
    image_path: text('image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    price: integer('price').notNull(),
    sold: boolean('sold').default(false),
    available: boolean('available').default(true),
    description: text('description'),
    piece_type: text('piece_type'),
    instagram: text('instagram'),
    real_width: real('real_width'),
    real_height: real('real_height'),
    active: boolean('active').default(true),
    theme: text('theme'),
    framed: boolean('framed').default(false),
    comments: text('comments'),
});

export type Pieces = InferSelectModel<typeof piecesTable>;
export type InsertPieces = InferInsertModel<typeof piecesTable>;

export const extraImagesTable = pgTable('ExtraImages', {
    id: serial('id').notNull().primaryKey(),
    piece_id: integer('piece_id')
        .notNull()
        .references(() => piecesTable.id),
    image_path: text('image_path').notNull(),
    title: text('title').default(''),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
});

export type ExtraImages = InferSelectModel<typeof extraImagesTable>;
export type InsertExtraImages = InferInsertModel<typeof extraImagesTable>;

export const progressImagesTable = pgTable('ProgressImages', {
    id: serial('id').notNull().primaryKey(),
    piece_id: integer('piece_id')
        .notNull()
        .references(() => piecesTable.id),
    image_path: text('image_path').notNull(),
    title: text('title').default(''),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
});

export type ProgressImages = InferSelectModel<typeof progressImagesTable>;
export type InsertProgressImages = InferInsertModel<typeof progressImagesTable>;

export const pendingTransactionsTable = pgTable('PendingTransactions', {
    id: serial('id').notNull().primaryKey(),
    piece_db_id: integer('piece_db_id').notNull(),
    piece_title: text('piece_title').notNull(),
    full_name: text('full_name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    address: text('address').notNull(),
    international: boolean('international').default(false),
});

export type PendingTransactions = InferSelectModel<typeof pendingTransactionsTable>;
export type InsertPendingTransactions = InferInsertModel<typeof pendingTransactionsTable>;

export const verifiedTransactionsTable = pgTable('VerifiedTransactions', {
    id: serial('id').notNull().primaryKey(),
    piece_db_id: integer('piece_db_id').notNull(),
    piece_title: text('piece_title').notNull(),
    full_name: text('full_name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    address: text('address').notNull(),
    international: boolean('international').default(false),
    image_path: text('image_path').notNull(),
    image_width: integer('image_width').notNull(),
    image_height: integer('image_height').notNull(),
    date: date('date').notNull(),
    stripe_id: text('stripe_id').notNull(),
    price: integer('price').notNull(),
});

export type VerifiedTransactions = InferSelectModel<typeof verifiedTransactionsTable>;
export type InsertVerifiedTransactions = InferInsertModel<typeof verifiedTransactionsTable>;

export type PiecesWithImages = Pieces & {
    extraImages: ExtraImages[];
    progressImages: ProgressImages[];
};
