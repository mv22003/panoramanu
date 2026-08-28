type UserClaimsLike = {
  email?: string | null;
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.ADMIN_EMAIL,
  );
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export function isAdminClaims(claims: UserClaimsLike | null | undefined) {
  const adminEmail = getAdminEmail();
  const userEmail = claims?.email?.trim().toLowerCase() ?? "";

  return Boolean(adminEmail && userEmail && adminEmail === userEmail);
}
