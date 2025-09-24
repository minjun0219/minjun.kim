"use server";

import { cookies } from "next/headers";

export function getPreferredTheme() {
  return cookies().get("theme");
}
