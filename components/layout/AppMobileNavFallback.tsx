export const AppMobileNavFallback = () => {
  return (
    <nav
      aria-hidden="true"
      className="app-mobile-nav-pad fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3 gap-2 px-4 py-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="mx-auto h-8 w-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </nav>
  );
};
