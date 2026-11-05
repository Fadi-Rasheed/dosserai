import "server-only";

import { getDailyQueryLimit } from "@/lib/config";
import {
  createSupabaseServiceClient,
  getAuthenticatedUser,
  PayloadError,
} from "@/lib/supabase/server";
import type { UsageSummary } from "@/lib/types";

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

export const getUsageSummary = async (): Promise<UsageSummary> => {
  const { supabase, user } = await getAuthenticatedUser();
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("usage")
    .select("queries_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    queriesToday: data?.queries_count ?? 0,
    dailyLimit: getDailyQueryLimit(),
  };
};

export const incrementUsage = async () => {
  const { user } = await getAuthenticatedUser();
  const service = createSupabaseServiceClient();
  const dailyLimit = getDailyQueryLimit();

  const { error } = await service.rpc("increment_query_usage", {
    p_user_id: user.id,
    p_daily_limit: dailyLimit,
  });

  if (error) {
    if (error.message.includes("Daily query limit reached")) {
      throw new PayloadError(429, "Daily query limit reached.");
    }

    throw new Error(error.message);
  }
};
