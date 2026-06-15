import { Link } from "@tanstack/react-router";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Info, LayoutDashboard, Trophy, Play, LogOut, Bell, Volume2, Swords, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";
import { getStreakReminderHours, setStreakReminderHours } from "@/lib/streak-settings";
import { Slider } from "@/components/ui/slider";
import { getSettings, setSettings } from "@/lib/sfx";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function HeaderMenu() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(12);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  useEffect(() => {
    if (!open) return;
    setHours(getStreakReminderHours());
    const s = getSettings();
    setSound(s.sound);
    setHaptics(s.haptics);
  }, [open]);

  const link = (to: string, icon: React.ReactNode, label: string, extra?: React.ReactNode) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
    >
      {icon}<span className="flex-1">{label}</span>{extra}
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[340px] p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-2 shrink-0">
          <SheetTitle>Quick shortcuts</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="mt-2 flex flex-col">
            {link("/", <Home className="w-4 h-4" />, "Home")}
            {link("/about", <Info className="w-4 h-4" />, "About")}
            {user && link("/dashboard", <LayoutDashboard className="w-4 h-4" />, "Dashboard")}
            {user && link("/interview", <Play className="w-4 h-4 text-emerald-500" />, "Start interview")}
            {user && link(
              "/interview-arena",
              <Swords className="w-4 h-4 text-fuchsia-500" />,
              "Interview Arena",
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-500 text-white animate-pulse">NEW</span>,
            )}
            {user && link(
              "/skillpass",
              <Award className="w-4 h-4 text-amber-500" />,
              "SkillPass",
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">NEW</span>,
            )}
            {user && link("/leaderboard", <Trophy className="w-4 h-4 text-amber-500" />, "Leaderboard")}
          </div>

          <div className="mt-6 border-t pt-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Bell className="w-4 h-4" /> Streak reminder
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Alert me <span className="font-semibold text-foreground">{hours}h</span> before my streak runs out.
              </p>
              <Slider
                value={[hours]} min={1} max={36} step={1}
                onValueChange={(v) => { setHours(v[0]); setStreakReminderHours(v[0]); }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium"><Volume2 className="w-4 h-4" /> Feedback</div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sfx-sound" className="text-sm font-normal">Sound effects</Label>
                <Switch id="sfx-sound" checked={sound} onCheckedChange={(v) => { setSound(v); setSettings({ sound: v }); }} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sfx-haptics" className="text-sm font-normal">Haptics</Label>
                <Switch id="sfx-haptics" checked={haptics} onCheckedChange={(v) => { setHaptics(v); setSettings({ haptics: v }); }} />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Theme</div>
              <div className="grid grid-cols-3 gap-2">
                {(["light","dark","system"] as const).map((t) => (
                  <Button
                    key={t} size="sm"
                    variant={theme === t ? "default" : "outline"}
                    onClick={() => setTheme(t)}
                    className="capitalize"
                  >{t}</Button>
                ))}
              </div>
            </div>
          </div>

          {user && (
            <div className="mt-6 border-t pt-5">
              <Button variant="outline" className="w-full" onClick={() => { setOpen(false); signOut(); }}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
