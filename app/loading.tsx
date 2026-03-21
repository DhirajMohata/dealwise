export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFE]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#E5E7EB]" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
        </div>
        <p className="text-sm text-[#4B5563]">Loading...</p>
      </div>
    </div>
  );
}
