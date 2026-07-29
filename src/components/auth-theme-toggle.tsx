"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "clartas-theme";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
}

export function AuthThemeToggle({ className }: { className?: string }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const initial: Theme = stored === "light" ? "light" : "dark";
        setTheme(initial);
        applyTheme(initial);
    }, []);

    function onToggle() {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
                className,
            )}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
    );
}
