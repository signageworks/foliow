import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
  doublePrecision,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const portfolioItemTypeEnum = pgEnum("portfolio_item_type", [
  "image",
  "video",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "employer_changed",
  "new_follower",
  "portfolio_liked",
  "review_received",
  "waitlist_slot_open",
  "travel_date_nearby",
  "new_comment",
]);

export const accountTypeEnum = pgEnum("account_type", [
  "individual",
  "company",
]);

export const locationVisibilityEnum = pgEnum("location_visibility", [
  "full",
  "area",
  "hidden",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "employer",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "inappropriate_content",
  "fake_profile",
  "spam",
  "harassment",
  "copyright",
  "other",
]);

// ─────────────────────────────────────────────
// TRADES
// ─────────────────────────────────────────────

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// EMPLOYERS
// ─────────────────────────────────────────────

export const employers = pgTable("employers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  website: varchar("website", { length: 500 }),
  logoUrl: text("logo_url"),
  bio: text("bio"),
  addressLine: varchar("address_line", { length: 300 }),
  city: varchar("city", { length: 100 }),
  postcode: varchar("postcode", { length: 10 }),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  locationVisibility: locationVisibilityEnum("location_visibility").notNull().default("area"),
  claimedByUserId: uuid("claimed_by_user_id"),
  isVerified: boolean("is_verified").notNull().default(false),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    passwordHash: text("password_hash"),
    avatarUrl: text("avatar_url"),
    introVideoUrl: text("intro_video_url"),
    bio: text("bio"),
    accountType: accountTypeEnum("account_type").notNull().default("individual"),
    subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("free"),
    tradeId: uuid("trade_id").references(() => trades.id, { onDelete: "set null" }),
    currentEmployerId: uuid("current_employer_id").references(() => employers.id, { onDelete: "set null" }),
    addressLine: varchar("address_line", { length: 300 }),
    city: varchar("city", { length: 100 }),
    postcode: varchar("postcode", { length: 10 }),
    locationLat: doublePrecision("location_lat"),
    locationLng: doublePrecision("location_lng"),
    locationVisibility: locationVisibilityEnum("location_visibility").notNull().default("area"),
    priceRangeMin: integer("price_range_min"),
    priceRangeMax: integer("price_range_max"),
    priceUnit: varchar("price_unit", { length: 20 }).default("day"),
    isAvailable: boolean("is_available").notNull().default(true),
    nextAvailableDate: timestamp("next_available_date", { withTimezone: true }),
    isOpenToWork: boolean("is_open_to_work").notNull().default(false),
    followersCount: integer("followers_count").notNull().default(0),
    followingCount: integer("following_count").notNull().default(0),
    portfolioCount: integer("portfolio_count").notNull().default(0),
    reviewsCount: integer("reviews_count").notNull().default(0),
    averageRating: doublePrecision("average_rating"),
    isVerified: boolean("is_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(t.username),
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    tradeIdx: index("users_trade_idx").on(t.tradeId),
    cityIdx: index("users_city_idx").on(t.city),
    employerIdx: index("users_employer_idx").on(t.currentEmployerId),
    availableIdx: index("users_available_idx").on(t.isAvailable),
    openToWorkIdx: index("users_open_to_work_idx").on(t.isOpenToWork),
    locationIdx: index("users_location_idx").on(t.locationLat, t.locationLng),
  })
);

// ─────────────────────────────────────────────
// AUTH.JS TABLOLARI
// ─────────────────────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 50 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    providerIdx: uniqueIndex("accounts_provider_idx").on(t.provider, t.providerAccountId),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => ({
    compositePk: uniqueIndex("verification_tokens_identifier_token_idx").on(t.identifier, t.token),
  })
);

// ─────────────────────────────────────────────
// İŞ GEÇMİŞİ
// ─────────────────────────────────────────────

export const employmentHistory = pgTable(
  "employment_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    employerId: uuid("employer_id").references(() => employers.id, { onDelete: "set null" }),
    employerName: varchar("employer_name", { length: 200 }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    isCurrent: boolean("is_current").notNull().default(true),
  },
  (t) => ({
    userIdx: index("employment_history_user_idx").on(t.userId),
    currentIdx: index("employment_history_current_idx").on(t.userId, t.isCurrent),
  })
);

// ─────────────────────────────────────────────
// SERTİFİKALAR
// ─────────────────────────────────────────────

export const userCertifications = pgTable(
  "user_certifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    issuingBody: varchar("issuing_body", { length: 200 }),
    certNumber: varchar("cert_number", { length: 100 }),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isVerified: boolean("is_verified").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    documentUrl: text("document_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("user_certifications_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────
// PORTFOLIO PROJELERİ (İş Günlüğü)
// ─────────────────────────────────────────────

export const portfolioProjects = pgTable(
  "portfolio_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    isPublic: boolean("is_public").notNull().default(true),
    coverItemId: uuid("cover_item_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("portfolio_projects_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────
// PORTFOLIO İTEMLARI
// ─────────────────────────────────────────────

export const portfolioItems = pgTable(
  "portfolio_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => portfolioProjects.id, { onDelete: "set null" }),
    type: portfolioItemTypeEnum("type").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    beforeImageUrl: text("before_image_url"),
    caption: text("caption"),
    tags: text("tags").array().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
    likesCount: integer("likes_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    locationName: varchar("location_name", { length: 200 }),
    locationLat: doublePrecision("location_lat"),
    locationLng: doublePrecision("location_lng"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("portfolio_items_user_idx").on(t.userId),
    projectIdx: index("portfolio_items_project_idx").on(t.projectId),
    featuredIdx: index("portfolio_items_featured_idx").on(t.userId, t.isFeatured),
  })
);

// ─────────────────────────────────────────────
// YORUMLAR (Post comments)
// ─────────────────────────────────────────────

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    portfolioItemId: uuid("portfolio_item_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    itemIdx: index("comments_item_idx").on(t.portfolioItemId),
    userIdx: index("comments_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────
// HİKAYELER (Stories)
// ─────────────────────────────────────────────

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    mediaUrl: text("media_url").notNull(),
    mediaType: varchar("media_type", { length: 10 }).notNull().default("image"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    viewsCount: integer("views_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("stories_user_idx").on(t.userId),
    expiresIdx: index("stories_expires_idx").on(t.expiresAt),
  })
);

// ─────────────────────────────────────────────
// SEYAHAT TARİHLERİ (Travelling Artist)
// ─────────────────────────────────────────────

export const userTravelDates = pgTable(
  "user_travel_dates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    city: varchar("city", { length: 100 }).notNull(),
    postcode: varchar("postcode", { length: 10 }),
    locationLat: doublePrecision("location_lat"),
    locationLng: doublePrecision("location_lng"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    slotsAvailable: integer("slots_available"),
    note: text("note"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("user_travel_dates_user_idx").on(t.userId),
    dateIdx: index("user_travel_dates_date_idx").on(t.startDate, t.endDate),
  })
);

// ─────────────────────────────────────────────
// TAKİP
// ─────────────────────────────────────────────

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("follows_pk").on(t.followerId, t.followingId),
    followerIdx: index("follows_follower_idx").on(t.followerId),
    followingIdx: index("follows_following_idx").on(t.followingId),
  })
);

// ─────────────────────────────────────────────
// BEĞENİLER
// ─────────────────────────────────────────────

export const portfolioLikes = pgTable(
  "portfolio_likes",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    portfolioItemId: uuid("portfolio_item_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("portfolio_likes_pk").on(t.userId, t.portfolioItemId),
    itemIdx: index("portfolio_likes_item_idx").on(t.portfolioItemId),
  })
);

// ─────────────────────────────────────────────
// KOLEKSİYONLAR
// ─────────────────────────────────────────────

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    isPrivate: boolean("is_private").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("collections_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────
// KAYDEDİLEN İÇERİKLER
// ─────────────────────────────────────────────

export const savedItems = pgTable(
  "saved_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    portfolioItemId: uuid("portfolio_item_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("saved_items_pk").on(t.userId, t.portfolioItemId),
    userIdx: index("saved_items_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────
// DEĞERLENDIRMELER
// ─────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body"),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("reviews_pk").on(t.reviewerId, t.subjectId),
    subjectIdx: index("reviews_subject_idx").on(t.subjectId),
  })
);

// ─────────────────────────────────────────────
// BİLDİRİMLER
// ─────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    data: jsonb("data").notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    recipientIdx: index("notifications_recipient_idx").on(t.recipientId),
    unreadIdx: index("notifications_unread_idx").on(t.recipientId, t.readAt),
  })
);

// ─────────────────────────────────────────────
// PROFİL GÖRÜNTÜLEMELERİ (Analitik)
// ─────────────────────────────────────────────

export const profileViews = pgTable(
  "profile_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileOwnerId: uuid("profile_owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    viewerId: uuid("viewer_id").references(() => users.id, { onDelete: "set null" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ownerIdx: index("profile_views_owner_idx").on(t.profileOwnerId),
    dateIdx: index("profile_views_date_idx").on(t.profileOwnerId, t.viewedAt),
  })
);

// ─────────────────────────────────────────────
// REFERRAL / DAVET SİSTEMİ
// ─────────────────────────────────────────────

export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    referredUserId: uuid("referred_user_id").references(() => users.id, { onDelete: "set null" }),
    referralCode: varchar("referral_code", { length: 20 }).notNull().unique(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    referrerIdx: index("referrals_referrer_idx").on(t.referrerId),
    codeIdx: uniqueIndex("referrals_code_idx").on(t.referralCode),
  })
);

// ─────────────────────────────────────────────
// BEKLEME LİSTESİ
// ─────────────────────────────────────────────

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workerId: uuid("worker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    note: text("note"),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workerIdx: index("waitlist_entries_worker_idx").on(t.workerId),
  })
);

// ─────────────────────────────────────────────
// NFC KARTLARI
// ─────────────────────────────────────────────

export const nfcCards = pgTable(
  "nfc_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    cardToken: varchar("card_token", { length: 64 }).notNull().unique(),
    nickname: varchar("nickname", { length: 100 }),
    tapsCount: integer("taps_count").notNull().default(0),
    followsFromCard: integer("follows_from_card").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("nfc_cards_user_idx").on(t.userId),
    tokenIdx: uniqueIndex("nfc_cards_token_idx").on(t.cardToken),
  })
);

// ─────────────────────────────────────────────
// MESAJLAŞMA
// ─────────────────────────────────────────────

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantAId: uuid("participant_a_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    participantBId: uuid("participant_b_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    participantsIdx: uniqueIndex("conversations_participants_idx").on(t.participantAId, t.participantBId),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    conversationIdx: index("messages_conversation_idx").on(t.conversationId),
    senderIdx: index("messages_sender_idx").on(t.senderId),
  })
);

// ─────────────────────────────────────────────
// İÇERİK RAPORLAMA (Moderasyon)
// ─────────────────────────────────────────────

export const contentReports = pgTable(
  "content_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reportedUserId: uuid("reported_user_id").references(() => users.id, { onDelete: "set null" }),
    reportedItemId: uuid("reported_item_id").references(() => portfolioItems.id, { onDelete: "set null" }),
    reason: reportReasonEnum("reason").notNull(),
    detail: text("detail"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    reporterIdx: index("content_reports_reporter_idx").on(t.reporterId),
  })
);

// ─────────────────────────────────────────────
// İŞVEREN ABONELİKLERİ (Para Modeli)
// ─────────────────────────────────────────────

export const employerSubscriptions = pgTable(
  "employer_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tier: subscriptionTierEnum("tier").notNull().default("free"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: uniqueIndex("employer_subscriptions_user_idx").on(t.userId),
  })
);

// ─────────────────────────────────────────────
// İLİŞKİLER
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  trade: one(trades, { fields: [users.tradeId], references: [trades.id] }),
  currentEmployer: one(employers, { fields: [users.currentEmployerId], references: [employers.id] }),
  portfolioItems: many(portfolioItems),
  portfolioProjects: many(portfolioProjects),
  employmentHistory: many(employmentHistory),
  certifications: many(userCertifications),
  travelDates: many(userTravelDates),
  nfcCards: many(nfcCards),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  savedItems: many(savedItems),
  collections: many(collections),
  reviewsReceived: many(reviews, { relationName: "subject" }),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  notifications: many(notifications),
  profileViews: many(profileViews),
  referralsMade: many(referrals),
  waitlistEntries: many(waitlistEntries),
  accounts: many(accounts),
  sessions: many(sessions),
  subscription: one(employerSubscriptions, { fields: [users.id], references: [employerSubscriptions.userId] }),
  comments: many(comments),
  stories: many(stories),
}));

export const tradesRelations = relations(trades, ({ many }) => ({
  users: many(users),
}));

export const employersRelations = relations(employers, ({ one, many }) => ({
  claimedBy: one(users, { fields: [employers.claimedByUserId], references: [users.id] }),
  currentEmployees: many(users),
  employmentHistory: many(employmentHistory),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one, many }) => ({
  user: one(users, { fields: [portfolioItems.userId], references: [users.id] }),
  project: one(portfolioProjects, { fields: [portfolioItems.projectId], references: [portfolioProjects.id] }),
  savedBy: many(savedItems),
  reports: many(contentReports),
  likes: many(portfolioLikes),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  portfolioItem: one(portfolioItems, { fields: [comments.portfolioItemId], references: [portfolioItems.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  user: one(users, { fields: [stories.userId], references: [users.id] }),
}));

export const portfolioLikesRelations = relations(portfolioLikes, ({ one }) => ({
  user: one(users, { fields: [portfolioLikes.userId], references: [users.id] }),
  portfolioItem: one(portfolioItems, { fields: [portfolioLikes.portfolioItemId], references: [portfolioItems.id] }),
}));

export const portfolioProjectsRelations = relations(portfolioProjects, ({ one, many }) => ({
  user: one(users, { fields: [portfolioProjects.userId], references: [users.id] }),
  items: many(portfolioItems),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
  user: one(users, { fields: [savedItems.userId], references: [users.id] }),
  portfolioItem: one(portfolioItems, { fields: [savedItems.portfolioItemId], references: [portfolioItems.id] }),
  collection: one(collections, { fields: [savedItems.collectionId], references: [collections.id] }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, { fields: [collections.userId], references: [users.id] }),
  items: many(savedItems),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  subject: one(users, { fields: [reviews.subjectId], references: [users.id], relationName: "subject" }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participantA: one(users, { fields: [conversations.participantAId], references: [users.id] }),
  participantB: one(users, { fields: [conversations.participantBId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const nfcCardsRelations = relations(nfcCards, ({ one }) => ({
  user: one(users, { fields: [nfcCards.userId], references: [users.id] }),
}));

export const employmentHistoryRelations = relations(employmentHistory, ({ one }) => ({
  user: one(users, { fields: [employmentHistory.userId], references: [users.id] }),
  employer: one(employers, { fields: [employmentHistory.employerId], references: [employers.id] }),
}));

export const userCertificationsRelations = relations(userCertifications, ({ one }) => ({
  user: one(users, { fields: [userCertifications.userId], references: [users.id] }),
}));

export const userTravelDatesRelations = relations(userTravelDates, ({ one }) => ({
  user: one(users, { fields: [userTravelDates.userId], references: [users.id] }),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
  profileOwner: one(users, { fields: [profileViews.profileOwnerId], references: [users.id] }),
  viewer: one(users, { fields: [profileViews.viewerId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id] }),
  referredUser: one(users, { fields: [referrals.referredUserId], references: [users.id] }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  reporter: one(users, { fields: [contentReports.reporterId], references: [users.id] }),
  reportedUser: one(users, { fields: [contentReports.reportedUserId], references: [users.id] }),
  reportedItem: one(portfolioItems, { fields: [contentReports.reportedItemId], references: [portfolioItems.id] }),
}));

export const employerSubscriptionsRelations = relations(employerSubscriptions, ({ one }) => ({
  user: one(users, { fields: [employerSubscriptions.userId], references: [users.id] }),
}));

// ─────────────────────────────────────────────
// TİP EXPORTLARI
// ─────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type Employer = typeof employers.$inferSelect;
export type NewEmployer = typeof employers.$inferInsert;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type NewPortfolioItem = typeof portfolioItems.$inferInsert;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type EmploymentHistory = typeof employmentHistory.$inferSelect;
export type UserCertification = typeof userCertifications.$inferSelect;
export type UserTravelDate = typeof userTravelDates.$inferSelect;
export type NfcCard = typeof nfcCards.$inferSelect;
export type SavedItem = typeof savedItems.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ProfileView = typeof profileViews.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ContentReport = typeof contentReports.$inferSelect;
export type EmployerSubscription = typeof employerSubscriptions.$inferSelect;
export type PortfolioLike = typeof portfolioLikes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
