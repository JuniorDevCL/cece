"use client";

import { useState } from "react";
import { Check, Link2, Plus, Video } from "lucide-react";
import { useTrainingData } from "@/contexts/data-context";
import { isValidYoutubeUrl, youtubeWatchUrl } from "@/lib/youtube";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MUSCLE_GROUPS = [
  "Piernas",
  "Cadena posterior",
  "Empuje",
  "Tracción",
  "Potencia",
  "Core",
  "Hombros",
  "Otro",
];

export default function PFEjerciciosPage() {
  const { exercises, addExercise } = useTrainingData();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Piernas");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [urlError, setUrlError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !muscleGroup.trim() || !youtubeUrl.trim()) return;

    if (!isValidYoutubeUrl(youtubeUrl)) {
      setUrlError("Ingresa un link válido de YouTube.");
      return;
    }

    addExercise({
      name,
      muscleGroup,
      description,
      youtubeUrl,
    });
    setSavedMessage(`“${name.trim()}” se agregó al catálogo.`);
    setName("");
    setDescription("");
    setYoutubeUrl("");
    setUrlError("");
    setMuscleGroup("Piernas");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-brand-sky" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-sky">
            Catálogo técnico
          </p>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Ejercicios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea ejercicios con un link de YouTube para que los deportistas vean
          la técnica.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(24rem,0.9fr)_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo ejercicio</CardTitle>
            <CardDescription>
              El video de referencia queda disponible en todas las rutinas que
              usen este ejercicio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="ex-name">Nombre</Label>
                <Input
                  id="ex-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Press militar"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ex-muscle">Grupo muscular</Label>
                <select
                  id="ex-muscle"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={muscleGroup}
                  onChange={(event) => setMuscleGroup(event.target.value)}
                >
                  {MUSCLE_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ex-description">Descripción</Label>
                <Input
                  id="ex-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Breve indicación técnica"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ex-youtube">Link de YouTube</Label>
                <Input
                  id="ex-youtube"
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) => {
                    setYoutubeUrl(event.target.value);
                    setUrlError("");
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                {urlError ? (
                  <p className="text-xs text-brand-red">{urlError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Acepta links normales, youtu.be o Shorts.
                  </p>
                )}
              </div>

              {savedMessage && (
                <p className="flex items-center gap-2 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-2 text-sm text-brand-yellow">
                  <Check className="size-4 shrink-0" />
                  {savedMessage}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Plus /> Guardar ejercicio
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Catálogo actual</h2>
              <p className="text-sm text-muted-foreground">
                {exercises.length} ejercicios disponibles para rutinas
              </p>
            </div>
            <Badge variant="secondary">
              <Video className="size-3.5" />
              YouTube
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[...exercises].reverse().map((exercise) => {
              const watchUrl = youtubeWatchUrl(exercise.youtubeUrl);
              return (
                <Card key={exercise.id}>
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge variant="outline">{exercise.muscleGroup}</Badge>
                      {watchUrl && (
                        <a
                          href={watchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-sky hover:underline"
                        >
                          <Link2 className="size-3.5" />
                          Ver video
                        </a>
                      )}
                    </div>
                    <CardTitle className="text-base">{exercise.name}</CardTitle>
                    <CardDescription>
                      {exercise.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
