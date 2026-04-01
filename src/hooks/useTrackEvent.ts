import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";
import type { Json } from "@/integrations/supabase/types";

export function useTrackEvent() {
  const { user } = useAuth();

  return useCallback(
    (eventName: string, metadata?: Record<string, unknown>) => {
      supabase.from("events").insert([{
        user_id: user?.id ?? null,
        event_name: eventName,
        metadata: (metadata ?? {}) as Json,
      }]).then(() => {});
    },
    [user]
  );
}
