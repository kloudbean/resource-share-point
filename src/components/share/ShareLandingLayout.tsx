import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import remaxLogo from "@/assets/remax-excellence-logo.png";

type ShareLandingLayoutProps = {
  children: ReactNode;
  /** Main column width */
  mainClassName?: string;
};

export default function ShareLandingLayout({ children, mainClassName = "max-w-xl" }: ShareLandingLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[hsl(220_28%_96%)] text-foreground dark:bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 0%, hsl(4 80% 56% / 0.08) 0%, transparent 45%),
            radial-gradient(circle at 80% 20%, hsl(220 50% 18% / 0.06) 0%, transparent 40%),
            linear-gradient(180deg, transparent 0%, hsl(220 20% 94% / 0.5) 100%)`,
        }}
        aria-hidden
      />
      <div className="relative">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-card/75 shadow-sm backdrop-blur-md dark:bg-card/80">
          <div className={`mx-auto flex w-full items-center justify-between gap-4 px-4 py-3.5 md:px-8 ${mainClassName}`}>
            <Link to="/" className="transition-opacity hover:opacity-90">
              <img src={remaxLogo} alt="REMAX Excellence Canada" className="h-8 w-auto object-contain md:h-9" />
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground"
            >
              Portal home
            </Link>
          </div>
        </header>

        <main className={`mx-auto w-full px-4 pb-16 pt-8 md:px-8 md:pt-12 ${mainClassName}`}>{children}</main>
      </div>
    </div>
  );
}
