export const AppSidebarFallback = () => {
  return (
    <aside
      className="hidden w-full flex-col border-b border-border bg-background lg:flex lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0"
      aria-busy="true"
      aria-label="Loading navigation"
    >
      <div className="flex h-20 items-center border-b border-border px-6">
        <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </aside>
  );
};
