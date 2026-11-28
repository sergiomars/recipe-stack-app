"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

export default function FavoriteButton({ recipeId, initialFavorite }: { recipeId: string; initialFavorite: boolean }) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const result = favorite
      ? await supabase.from("recipe_favorites").delete().eq("recipe_id", recipeId)
      : await supabase.from("recipe_favorites").insert({ recipe_id: recipeId });

    if (result.error) {
      showToast(`Favorit konnte nicht ${favorite ? "entfernt" : "gespeichert"} werden: ${result.error.message}`, "error");
    } else {
      const nextFavorite = !favorite;
      setFavorite(nextFavorite);
      showToast(nextFavorite ? "Rezept zu deinen Favoriten hinzugefügt." : "Rezept aus deinen Favoriten entfernt.", "info");
      router.refresh();
    }
    setBusy(false);
  }

  return <button type="button" className={`favorite-button${favorite ? " is-favorite" : ""}`} onClick={toggle} disabled={busy} aria-pressed={favorite} aria-label={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"} title={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}>
    <span aria-hidden="true">{favorite ? "★" : "☆"}</span>
  </button>;
}
