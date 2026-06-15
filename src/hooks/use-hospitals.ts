import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Hospital, mapSupabaseHospital, getCachedOrDefaultHospitals } from "@/lib/mock-data";
import { setItemSafe } from "@/lib/storage";

export function useHospitals() {
  return useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("hospitals")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn("Supabase hospitals table is empty. Falling back to mock data.");
          return getCachedOrDefaultHospitals();
        }

        const mapped = data.map(mapSupabaseHospital);
        // Cache in localStorage to support synchronous fallback helpers
        setItemSafe("medicompare_hospitals_cache", mapped);
        return mapped;
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to mock data:", err);
        return getCachedOrDefaultHospitals();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHospital(hospitalId: string | undefined) {
  return useQuery<Hospital | null>({
    queryKey: ["hospital", hospitalId],
    queryFn: async () => {
      if (!hospitalId) return null;
      try {
        const { data, error } = await supabase
          .from("hospitals")
          .select("*")
          .eq("id", hospitalId)
          .single();

        if (error) {
          throw error;
        }

        return mapSupabaseHospital(data);
      } catch (err) {
        console.warn(
          `Supabase fetch for hospital ${hospitalId} failed. Falling back to mock data:`,
          err,
        );
        const list = getCachedOrDefaultHospitals();
        return list.find((h) => h.id === hospitalId) ?? null;
      }
    },
    enabled: !!hospitalId,
    staleTime: 5 * 60 * 1000,
  });
}
