import Link from "next/link";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-foreground"
      aria-label="Dosserai home"
    >
      <span className="relative flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="3.5"
            width="8.5"
            height="10"
            rx="1.4"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <rect
            x="5.5"
            y="2"
            width="8.5"
            height="10"
            rx="1.4"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Dosserai</span>
    </Link>
  );
}
