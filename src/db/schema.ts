import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["pf", "deportista"]);
export const periodTypeEnum = pgEnum("period_type", [
  "carga",
  "descarga",
  "transicion",
]);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  gender: text("gender").notNull(),
  ageGroup: text("age_group").notNull(),
  label: text("label").notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  categoryId: text("category_id").references(() => categories.id),
});

export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  description: text("description").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
});

export const routines = pgTable("routines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const routineExercises = pgTable("routine_exercises", {
  id: text("id").primaryKey(),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  dayNumber: smallint("day_number").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  order: integer("order").notNull(),
});

export const trainingPeriods = pgTable("training_periods", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: periodTypeEnum("type").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  color: text("color").notNull(),
});

export const routineAssignments = pgTable("routine_assignments", {
  id: text("id").primaryKey(),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id),
  periodId: text("period_id")
    .notNull()
    .references(() => trainingPeriods.id, { onDelete: "cascade" }),
});

export const exerciseCompletions = pgTable(
  "exercise_completions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    routineExerciseId: text("routine_exercise_id")
      .notNull()
      .references(() => routineExercises.id, { onDelete: "cascade" }),
    completedDate: date("completed_date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("exercise_completions_user_re_date_idx").on(
      table.userId,
      table.routineExerciseId,
      table.completedDate
    ),
  ]
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    routineDay: smallint("routine_day").notNull(),
    present: boolean("present").notNull().default(true),
    markedAt: timestamp("marked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("attendance_records_user_date_idx").on(table.userId, table.date),
  ]
);
