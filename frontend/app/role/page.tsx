import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Select Role | LevelUp Fitness",
  description: "Choose your role to log in and access your LevelUp Fitness dashboard.",
};

export default function RoleSelectionPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between overflow-hidden font-sans">
      {/* Premium background radial glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-accent/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-accent/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />

      {/* Header spacing */}
      <div className="hidden sm:flex items-center justify-end px-8 py-4">
        <ThemeToggle />
      </div>

      {/* Main container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-16 max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <header className="text-center mb-12 lg:mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-foreground">
            LEVELUP <span className="text-accent drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">FITNESS</span>
          </h1>
          <p className="text-muted text-sm sm:text-base md:text-lg max-w-md mx-auto font-medium">
            Choose your role to continue
          </p>
        </header>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* User Card */}
          <Link
            href="/login?role=user"
            id="role-card-user"
            className="group relative flex flex-col bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-accent/50 hover:shadow-[0_0_35px_-5px_rgba(234,179,8,0.15)] overflow-hidden"
          >
            {/* Hover top border light accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Card Icon container */}
            <div className="mb-6 w-16 h-16 rounded-xl bg-card-secondary/50 border border-border/50 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30">
              <svg 
                className="w-8 h-8 text-accent transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                {/* Dumbbell Icon */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18.5 5.5l3 3-2.5 2.5-3-3 2.5-2.5zM5.5 18.5l3 3-2.5 2.5-3-3 2.5-2.5z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                  User
                </h2>
                <p className="text-muted text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  Log in as a client to view workout schedules, track nutrition, log body metrics, and hit your fitness milestones.
                </p>
              </div>

              {/* Bottom indicator */}
              <div className="mt-8 flex items-center text-accent text-xs font-bold uppercase tracking-wider gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                Continue
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Coach Card */}
          <Link
            href="/login?role=coach"
            id="role-card-coach"
            className="group relative flex flex-col bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-accent/50 hover:shadow-[0_0_35px_-5px_rgba(234,179,8,0.15)] overflow-hidden"
          >
            {/* Hover top border light accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Card Icon container */}
            <div className="mb-6 w-16 h-16 rounded-xl bg-card-secondary/50 border border-border/50 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30">
              <svg 
                className="w-8 h-8 text-accent transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                {/* Clipboard Icon */}
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 14 2 2 4-4" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                  Coach
                </h2>
                <p className="text-muted text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  Access your professional training suite. Monitor clients, construct tailored workout templates, and analyze team stats.
                </p>
              </div>

              {/* Bottom indicator */}
              <div className="mt-8 flex items-center text-accent text-xs font-bold uppercase tracking-wider gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                Continue
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            href="/login?role=admin"
            id="role-card-admin"
            className="group relative flex flex-col bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-accent/50 hover:shadow-[0_0_35px_-5px_rgba(234,179,8,0.15)] overflow-hidden"
          >
            {/* Hover top border light accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Card Icon container */}
            <div className="mb-6 w-16 h-16 rounded-xl bg-card-secondary/50 border border-border/50 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30">
              <svg 
                className="w-8 h-8 text-accent transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                {/* Shield Settings Gear Icon */}
                <circle cx="12" cy="12" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                  Admin
                </h2>
                <p className="text-muted text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  Configure platform settings, manage users and roles, audit activity logs, and oversee global system health.
                </p>
              </div>

              {/* Bottom indicator */}
              <div className="mt-8 flex items-center text-accent text-xs font-bold uppercase tracking-wider gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                Continue
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex w-full justify-center gap-8 py-8 text-[10px] tracking-wider font-semibold text-muted">
        <a href="#" className="hover:text-accent transition-colors duration-200 uppercase">Privacy Policy</a>
        <a href="#" className="hover:text-accent transition-colors duration-200 uppercase">Terms of Service</a>
        <a href="#" className="hover:text-accent transition-colors duration-200 uppercase">Cookie Policy</a>
      </footer>
    </div>
  );
}
