"use client";

import { useState, useCallback } from "react";
import {
  Genre,
  Block,
  CanvasState,
  UserPreferences,
  BlocksResponse,
  InteractionResponse,
} from "@/types";
import GenrePicker from "@/components/GenrePicker";
import CreationCanvas from "@/components/CreationCanvas";
import IdeasWorkshop from "@/components/IdeasWorkshop";

export default function Home() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    world: [],
    characters: [],
    theme: [],
    mood: [],
  });
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(1);

  const fetchInitialBlocks = useCallback(async (selectedGenre: Genre) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: selectedGenre,
          user_preferences: {},
          canvas_state: { world: [], characters: [], theme: [], mood: [] },
        }),
      });
      const data: BlocksResponse = await res.json();
      setBlocks(data.blocks);
    } catch (err) {
      console.error("Failed to fetch initial blocks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenreSelect = useCallback(
    (selectedGenre: Genre) => {
      setGenre(selectedGenre);
      fetchInitialBlocks(selectedGenre);
    },
    [fetchInitialBlocks]
  );

  const handleBlockSelect = useCallback(
    async (block: Block) => {
      if (!genre || loading) return;
      setLoading(true);

      try {
        const res = await fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selected_block: block,
            canvas_state: canvasState,
            user_preferences: preferences,
            genre,
          }),
        });

        const data: InteractionResponse = await res.json();
        setCanvasState(data.canvas_state);
        setPreferences(data.user_preferences);
        setNarration(data.narration);
        setBlocks(data.next_blocks);
        setTurn((t) => t + 1);
      } catch (err) {
        console.error("Failed to process interaction:", err);
      } finally {
        setLoading(false);
      }
    },
    [genre, canvasState, preferences, loading]
  );

  const handleReset = useCallback(() => {
    setGenre(null);
    setCanvasState({ world: [], characters: [], theme: [], mood: [] });
    setPreferences({});
    setBlocks([]);
    setNarration("");
    setTurn(1);
  }, []);

  // Genre selection screen
  if (!genre) {
    return <GenrePicker onSelect={handleGenreSelect} />;
  }

  // Main game screen - split layout
  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Creative Engine
          </h1>
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
            {genre}
          </span>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors"
        >
          Start Over
        </button>
      </header>

      {/* Split Screen */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* LEFT: Creation Canvas */}
        <div className="flex-1 min-w-0">
          <CreationCanvas
            canvasState={canvasState}
            genre={genre}
            narration={narration}
          />
        </div>

        {/* RIGHT: Ideas Workshop */}
        <div className="w-[380px] flex-shrink-0">
          <IdeasWorkshop
            blocks={blocks}
            onSelectBlock={handleBlockSelect}
            loading={loading}
            turn={turn}
          />
        </div>
      </main>
    </div>
  );
}
