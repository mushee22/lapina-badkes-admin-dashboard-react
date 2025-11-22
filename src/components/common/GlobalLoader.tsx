export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[999999] grid place-items-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* <div className="flex items-center gap-2">
          <img src="/images/logo/logo.jpg" alt="Loading" className="h-8 dark:hidden" />
          <img src="/images/logo/logo.jpg" alt="Loading" className="hidden h-8 dark:block" />
        </div> */}
        <div className="h-12 w-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Checking authentication...</p>
      </div>
    </div>
  );
}