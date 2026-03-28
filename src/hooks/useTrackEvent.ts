import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export function useTrackEvent() {
  const { user } = useAuth();

  return useCallback(
    async (eventName: string, metadata?: Record<string, unknown>) => {
      await supabase.from("events").insert({
        user_id: user?.id ?? null,
        event_name: eventName,
        metadata: metadata ?? {},
      });
    },
    [user]
  );
}
