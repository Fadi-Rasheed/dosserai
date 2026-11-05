export const getSafeRedirectPath = (
  next: string | null,
  fallback = "/dashboard",
) => {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("://")
  ) {
    return fallback;
  }

  return next;
};
