"use server";

import type { State } from "@/app/[locale]/utils/checkout";

/**
 * Fetches states / governorates for a given ISO-2 country code.
 * Runs 100% on the server — no state data ever ships to the client bundle.
 */
export async function getStatesByCountry(
  countryCode: string,
): Promise<State[]> {
  if (!countryCode) return [];

  try {
    // Step 1: Resolve ISO-2 code → full country name (CountriesNow uses full names)
    const isoRes = await fetch(
      "https://countriesnow.space/api/v0.1/countries/iso",
      { next: { revalidate: 86400 } },
    );

    if (!isoRes.ok) throw new Error("ISO lookup failed");

    const isoData = await isoRes.json();
    const entry = (isoData?.data ?? []).find(
      (c: { Iso2: string; name: string }) =>
        c.Iso2?.toUpperCase() === countryCode.toUpperCase(),
    );

    if (!entry) return [];

    // Step 2: Fetch states by resolved country name
    const statesRes = await fetch(
      "https://countriesnow.space/api/v0.1/countries/states",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: entry.name }),
        next: { revalidate: 86400 },
      },
    );

    if (!statesRes.ok) throw new Error("States fetch failed");

    const statesData = await statesRes.json();

    if (statesData.error || !Array.isArray(statesData.data?.states)) return [];

    return (statesData.data.states as { name: string; state_code?: string }[])
      .map((s) => ({
        code: s.state_code ?? s.name.slice(0, 3).toUpperCase(),
        name: s.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Graceful degradation — UI handles empty states array
    return [];
  }
}
