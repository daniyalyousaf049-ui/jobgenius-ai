import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPWA({ variant = "ghost" }: { variant?: "ghost" | "outline" | "default" }) {
  const [prompt, setPrompt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBIP = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      toast.success("JobGenius AI installed!");
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    // already installed?
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) {
      // iOS / unsupported fallback instructions
      toast.info("To install: tap your browser's Share menu → Add to Home Screen.");
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") toast.success("Installing JobGenius AI…");
    setPrompt(null);
  };

  if (installed) return null;

  return (
    <Button variant={variant} size="sm" onClick={handleInstall} className="hidden sm:inline-flex">
      <Download className="w-4 h-4 mr-1" /> Get app
    </Button>
  );
}
