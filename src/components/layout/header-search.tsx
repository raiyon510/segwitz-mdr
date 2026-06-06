"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto hidden md:flex max-w-md flex-1 items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search meetings, decisions, actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 rounded-full border-border/60 bg-muted/30 pl-10 shadow-sm transition-shadow focus-visible:bg-background focus-visible:shadow-md"
        />
      </div>
      <Button type="submit" size="sm" className="rounded-full px-4 shadow-sm">
        Search
      </Button>
    </form>
  );
}
