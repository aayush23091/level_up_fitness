export function getProfileImageUrl(profilePhoto?: string): string {
  if (!profilePhoto) return "";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Already absolute
  if (profilePhoto.startsWith("http://") || profilePhoto.startsWith("https://")) {
    return profilePhoto;
  }

  const normalized = profilePhoto.replace(/\\/g, "/");

  // If backend stored a relative /uploads/... URL (new or migrated)
  if (normalized.startsWith("/uploads/")) {
    return baseUrl ? `${baseUrl}${normalized}` : normalized;
  }

  // If it contains uploads in a longer path (e.g. backend\\uploads\\avatars\\file.jpg or C:\...\backend\uploads\avatars\file.jpg)
  const uploadsIndex = normalized.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    const uploadsPath = normalized.slice(uploadsIndex); // /uploads/... (or /uploads/<file>)
    return baseUrl ? `${baseUrl}${uploadsPath}` : uploadsPath;
  }

  // If stored as uploads/... without leading slash
  if (normalized.startsWith("uploads/")) {
    const uploadsPath = `/${normalized}`;
    return baseUrl ? `${baseUrl}${uploadsPath}` : uploadsPath;
  }

  return "";
}

