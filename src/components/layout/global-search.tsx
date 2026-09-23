"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Users, GraduationCap, LayoutDashboard, BookOpen, Loader2, X } from "lucide-react";
import { globalSearch, SearchResult } from "@/features/search/search.actions";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const res = await globalSearch(query);
        setResults(res);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "STUDENT":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "TEACHER":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "CLASS":
        return <LayoutDashboard className="h-4 w-4 text-blue-500" />;
      case "SUBJECT":
        return <BookOpen className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search students, teachers, classes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="w-full bg-muted/50 border border-transparent h-10 rounded-full pl-10 pr-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Search Dropdown Results */}
      {isOpen && (
        <div className="absolute top-12 left-0 right-0 z-50 bg-card border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {results.length === 0 ? (
            <div className="p-4 text-xs text-center text-muted-foreground">
              No results matching "{query}"
            </div>
          ) : (
            <div className="p-2 divide-y divide-border">
              {results.map((res) => (
                <button
                  key={`${res.type}-${res.id}`}
                  onClick={() => handleSelect(res.url)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-muted/50 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-background transition-colors">
                      {getIcon(res.type)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {res.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{res.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {res.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
