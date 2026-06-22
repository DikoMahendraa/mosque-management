import { AppLogo } from "@/components/ui/AppLogo";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background)] px-6 text-center">
      <AppLogo size="xl" priority />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Anda sedang offline
        </h1>
        <p className="max-w-sm text-sm text-gray-600">
          Periksa koneksi internet Anda, lalu coba buka kembali halaman ini.
        </p>
      </div>
    </main>
  );
}
