import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Sun, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";
import { DevInfoCard } from "@/components/DevInfoCard";
import { Logo } from "@/components/Logo";
import { InstallPWA } from "@/components/InstallPWA";
import { HeaderMenu } from "@/components/HeaderMenu";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { resolved, toggle } = useTheme();
  const router = useRouter();
  const online = useOnline();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showDev = pathname === "/about";

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > 80 && latest > prev) setHidden(true);
    else setHidden(false);
  });

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!online && (
        <div className="bg-destructive text-destructive-foreground text-sm py-2 text-center font-medium">
          You're offline — interviews are paused. Reconnect to continue.
        </div>
      )}
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo size={36} />
            <span className="font-display font-bold text-lg tracking-tight hidden sm:inline text-fluid">
              JobGenius AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/" className="px-3 py-2 rounded-lg hover:bg-muted transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "px-3 py-2 rounded-lg bg-muted font-medium" }}>Home</Link>
            <Link to="/about" className="px-3 py-2 rounded-lg hover:bg-muted transition-colors" activeProps={{ className: "px-3 py-2 rounded-lg bg-muted font-medium" }}>About</Link>
            {user && (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-lg hover:bg-muted transition-colors" activeProps={{ className: "px-3 py-2 rounded-lg bg-muted font-medium" }}>Dashboard</Link>
                <Link to="/leaderboard" className="px-3 py-2 rounded-lg hover:bg-muted transition-colors inline-flex items-center gap-1" activeProps={{ className: "px-3 py-2 rounded-lg bg-muted font-medium inline-flex items-center gap-1" }}>
                  <Trophy className="w-3.5 h-3.5" /> Leaderboard
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <InstallPWA />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              className="overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={resolved}
                  initial={{ y: 14, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -14, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex"
                >
                  {resolved === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:inline-flex">
                <LogOut className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Sign out</span>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-hero hover:opacity-90 shadow-elegant hidden sm:inline-flex">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
            <HeaderMenu />
          </div>
        </div>
      </motion.header>
      <main className="flex-1">{children}{showDev && <DevInfoCard />}</main>
      <footer className="border-t border-border/60 mt-20">
        <div className="container mx-auto px-6 py-10 max-w-7xl grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Logo size={28} />
              <span className="font-display font-bold">JobGenius AI</span>
            </div>
            <p className="text-muted-foreground">AI-powered mock interviews that actually feel real.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Built by</h4>
            <p className="text-muted-foreground">DANIYAL YOUSAF</p>
            <p className="text-muted-foreground">BSAI-2B</p>
            <a
              href="https://www.linkedin.com/in/daniyal-yousaf-740593400"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-block mt-1"
            >
              LinkedIn →
            </a>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Project</h4>
            <p className="text-muted-foreground">University capstone — AI Interview Assistant powered by Groq.</p>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DANIYAL YOUSAF · All rights reserved.
        </div>
      </footer>
    </div>
  );
}
