import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  categories,
  exercises,
  routineAssignments,
  routineExercises,
  routines,
  trainingPeriods,
  users,
} from "../src/db/schema";
import {
  categories as seedCategories,
  exercises as seedExercises,
  routineAssignments as seedAssignments,
  routineExercises as seedRoutineExercises,
  routines as seedRoutines,
  trainingPeriods as seedPeriods,
  users as seedUsers,
} from "../src/lib/mockData";

const DEFAULT_PASSWORD = "excelsior2026";

async function main() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error("Define DATABASE_URL antes de ejecutar el seed.");
  }

  const db = getDb();
  const passwordHash = await hash(DEFAULT_PASSWORD, 12);

  console.log("Creando tablas si no existen…");
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('pf', 'deportista');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE period_type AS ENUM ('carga', 'descarga', 'transicion');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY,
      gender text NOT NULL,
      age_group text NOT NULL,
      label text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      name text NOT NULL,
      role user_role NOT NULL,
      category_id text REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id text PRIMARY KEY,
      name text NOT NULL,
      muscle_group text NOT NULL,
      description text NOT NULL DEFAULT '',
      youtube_url text NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS routines (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      created_by_id text NOT NULL REFERENCES users(id),
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id text PRIMARY KEY,
      routine_id text NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      exercise_id text NOT NULL REFERENCES exercises(id),
      day_number smallint NOT NULL,
      sets integer NOT NULL,
      reps integer NOT NULL,
      rest_seconds integer NOT NULL,
      "order" integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS training_periods (
      id text PRIMARY KEY,
      name text NOT NULL,
      type period_type NOT NULL,
      category_id text NOT NULL REFERENCES categories(id),
      start_date date NOT NULL,
      end_date date NOT NULL,
      color text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS routine_assignments (
      id text PRIMARY KEY,
      routine_id text NOT NULL REFERENCES routines(id),
      period_id text NOT NULL REFERENCES training_periods(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS exercise_completions (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      routine_exercise_id text NOT NULL REFERENCES routine_exercises(id) ON DELETE CASCADE,
      completed_date date NOT NULL,
      completed_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS exercise_completions_user_re_date_idx
      ON exercise_completions (user_id, routine_exercise_id, completed_date);
    CREATE TABLE IF NOT EXISTS attendance_records (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date date NOT NULL,
      routine_day smallint NOT NULL,
      present boolean NOT NULL DEFAULT true,
      marked_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS attendance_records_user_date_idx
      ON attendance_records (user_id, date);
  `);

  console.log("Limpiando datos demo…");
  await db.execute(sql`
    TRUNCATE TABLE attendance_records, exercise_completions, routine_assignments,
    training_periods, routine_exercises, routines, exercises, users, categories
    RESTART IDENTITY CASCADE
  `);

  console.log("Insertando categorías…");
  await db.insert(categories).values(
    seedCategories.map((item) => ({
      id: item.id,
      gender: item.gender,
      ageGroup: item.ageGroup,
      label: item.label,
    }))
  );

  console.log("Insertando usuarios…");
  await db.insert(users).values(
    seedUsers.map((item) => ({
      id: item.id,
      email: item.email,
      passwordHash,
      name: item.name,
      role: item.role,
      categoryId: item.categoryId,
    }))
  );

  console.log("Insertando ejercicios y rutinas…");
  await db.insert(exercises).values(
    seedExercises.map((item) => ({
      id: item.id,
      name: item.name,
      muscleGroup: item.muscleGroup,
      description: item.description,
      youtubeUrl: item.youtubeUrl,
    }))
  );

  await db.insert(routines).values(
    seedRoutines.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdById: item.createdById,
      createdAt: new Date(item.createdAt),
    }))
  );

  await db.insert(routineExercises).values(
    seedRoutineExercises.map((item) => ({
      id: item.id,
      routineId: item.routineId,
      exerciseId: item.exerciseId,
      dayNumber: item.dayNumber,
      sets: item.sets,
      reps: item.reps,
      restSeconds: item.restSeconds,
      order: item.order,
    }))
  );

  await db.insert(trainingPeriods).values(
    seedPeriods.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      categoryId: item.categoryId,
      startDate: item.startDate,
      endDate: item.endDate,
      color: item.color,
    }))
  );

  await db.insert(routineAssignments).values(
    seedAssignments.map((item) => ({
      id: item.id,
      routineId: item.routineId,
      periodId: item.periodId,
    }))
  );

  console.log("\nSeed completado.");
  console.log(`Contraseña demo para todos los usuarios: ${DEFAULT_PASSWORD}`);
  console.log("PF: carlos.pf@cece.club");
  console.log("Deportistas: lucia.vargas@cece.club, diego.rivas@cece.club, sofia.torres@cece.club");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
