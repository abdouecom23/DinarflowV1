import { relations } from 'drizzle-orm';
import { pgTable, text, integer, bigint, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  full_name: text('full_name').notNull(),
  payment_tag: text('payment_tag').notNull().unique(),
  kyc_level: integer('kyc_level').notNull(),
  kyc_status: text('kyc_status').default('PENDING'),
  role: text('role').default('USER'),
  created_at: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  iban: text('iban').notNull().unique(),
  balance: bigint('balance', { mode: 'number' }).default(0),
  version: integer('version').default(1),
  status: text('status').default('ACTIVE'),
  created_at: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  account_id: uuid('account_id').references(() => accounts.id).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  reference: text('reference'),
  status: text('status').default('PENDING'),
  idempotencyKey: text('idempotencyKey').notNull().unique(),
  created_at: timestamp('created_at').defaultNow(),
});

export const ledger_entries = pgTable('ledger_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: text('transactionId').notNull(),
  account_id: uuid('account_id').references(() => accounts.id).notNull(),
  direction: text('direction').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.user_id], references: [users.id] }),
  transactions: many(transactions),
  ledger_entries: many(ledger_entries),
}));
