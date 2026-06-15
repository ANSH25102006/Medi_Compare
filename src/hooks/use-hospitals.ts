import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Hospital, mapSupabaseHospital } from "@/lib/mock-data";
import { setItemSafe } from "@/lib/storage";

export function useHospitals() {
  return useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }
      
      const mapped = (data || []).map(mapSupabaseHospital);
      // Cache in localStorage to support synchronous fallback helpers
      setItemSafe("medicompare_hospitals_cache", mapped);
      return mapped;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHospital(hospitalId: string | undefined) {
  return useQuery<Hospital | null>({
    queryKey: ["hospital", hospitalId],
    queryFn: async () => {
      if (!hospitalId) return null;
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", hospitalId)
        .single();

      if (error) {
        throw error;
      }

      return mapSupabaseHospital(data);
    },
    enabled: !!hospitalId,
    staleTime: 5 * 60 * 1000,
  });
}
