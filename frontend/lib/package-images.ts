export const packageImages = {
  "ladakh-high-pass": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1100&q=85",
  "pangong-lake": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Pangong_Lake%2C_Ladakh%2C_India_02.jpg",
  "pahalgam-valley": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1100&q=85",
  "gulmarg-snow": "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=1100&q=85",
} as const;

export type PackageImageKey = keyof typeof packageImages;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
