"use server";

import { cookies } from "next/headers";

export async function getPreferredTheme() {
  const cookieStore = await cookies();
  return cookieStore.get("theme");
}
