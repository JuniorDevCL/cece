/** Extrae el ID de un link de YouTube (watch, shorts, youtu.be, embed). */
export function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const match = parsed.pathname.match(
        /^\/(embed|shorts|live)\/([^/?#]+)/
      );
      return match?.[2] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youtubeWatchUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}
