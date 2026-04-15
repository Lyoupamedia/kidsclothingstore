import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type SiteSettings = Record<string, string>;

let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");
  if (error) throw error;
  const settings: SiteSettings = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || {});
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    if (!fetchPromise) {
      fetchPromise = fetchSettings();
    }
    fetchPromise.then((s) => {
      cachedSettings = s;
      setSettings(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { settings, loading };
}
