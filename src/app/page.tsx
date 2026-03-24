"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Genre, Block, CanvasState, UserPreferences,
  BlocksResponse, InteractionResponse, PlayerState,
} from "@/types";
import GenrePicker from "@/components/GenrePicker";
import CreationCanvas from "@/components/CreationCanvas";
import IdeasWorkshop from "@/components/IdeasWorkshop";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import ProgressBar from "@/components/ProgressBar";
import { useGameManager } from "@/hooks/useGameManager";
import { calculateFinalScore } from "@/game/GameState";
import {
  playClickSound, playSuccessSound, playSpawnSound,
  playCompletionSound, startAmbientLoop, stopAmbientLoop,
} from "@/utils/audio";

type AppScreen = "genre-select" | "build" | "genre-switch" | "play" | "game-win" | "game-lose";

const MAX_TURNS = 4;

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("genre-select");
  const [genre, setGenre] = useState<Genre | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({ world: [], characters: [], theme: [], mood: [] });
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(1);
  const [pipelineStage, setPipelineStage] = useState("idle");
  const [showInsights, setShowInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState("");
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [lastSelectedBlock, setLastSelectedBlock] = useState<Block | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const processingRef = useRef(false);
  const audioStartedRef = useRef(false);

  const {
    elements, gameState, objective, score, boosted,
    gameWon, gameLost, scorePopups, collectEffects,
    stunActive, countdownNumber,
    initGame, checkCollisions, removeCollectEffect,
  } = useGameManager(canvasState, genre || "Racing");

  const ensureAudio = useCallback(() => {
    if (!audioStartedRef.current) {
      audioStartedRef.current = true;
      startAmbientLoop();
    }
  }, []);

  useEffect(() => () => stopAmbientLoop(), []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Win/Lose detection
  useEffect(() => {
    if (gameWon && screen === "play") {
      setTimeout(() => {
        setShowConfetti(true);
        setScreen("game-win");
        playCompletionSound();
      }, 600);
    }
  }, [gameWon, screen]);

  useEffect(() => {
    if (gameLost && screen === "play") {
      setTimeout(() => setScreen("game-lose"), 300);
    }
  }, [gameLost, screen]);

  const fetchInitialBlocks = useCallback(
    async (selectedGenre: Genre, prefs: UserPreferences, summary: string, recent: Block[]) => {
      setLoading(true);
      setPipelineStage("designing");
      setError(null);
      try {
        const res = await fetch("/api/generate-blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            genre: selectedGenre, user_preferences: prefs,
            canvas_state: { world: [], characters: [], theme: [], mood: [] },
            session_summary: summary, recent_blocks: recent,
          }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: BlocksResponse = await res.json();
        if (data.blocks?.length === 3) setBlocks(data.blocks);
        else throw new Error("Invalid block response");
      } catch {
        setError("Could not load ideas. Retrying...");
        setTimeout(() => fetchInitialBlocks(selectedGenre, prefs, summary, recent), 2000);
      } finally {
        setPipelineStage("idle");
        setLoading(false);
      }
    },
    []
  );

  const handleGenreSelect = useCallback(
    (selectedGenre: Genre) => {
      ensureAudio();
      playClickSound();
      setGenre(selectedGenre);
      setScreen("build");
      setShowConfetti(false);
      setShowPlayButton(false);
      setError(null);
      setCanvasState({ world: [], characters: [], theme: [], mood: [] });
      setNarration("");
      setBlocks([]);
      setTurn(1);
      setLastSelectedBlock(null);
      fetchInitialBlocks(selectedGenre, preferences, sessionSummary, recentBlocks);
    },
    [fetchInitialBlocks, preferences, sessionSummary, recentBlocks, ensureAudio]
  );

  const handleGenreSwitch = useCallback(() => { playClickSound(); setScreen("genre-switch"); }, []);

  const handleBlockSelect = useCallback(
    async (block: Block) => {
      if (!genre || loading || processingRef.current) return;
      processingRef.current = true;
      setLoading(true);
      setError(null);
      ensureAudio();
      playSpawnSound();
      try {
        setPipelineStage("updating-state");
        await delay(250);
        setPipelineStage("narrating");
        await delay(150);
        setPipelineStage("designing");
        const res = await fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selected_block: block, canvas_state: canvasState,
            user_preferences: preferences, genre,
            session_summary: sessionSummary, recent_blocks: recentBlocks,
          }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        setPipelineStage("safety-check");
        const data: InteractionResponse = await res.json();
        if (data.canvas_state) setCanvasState(data.canvas_state);
        if (data.user_preferences) setPreferences(data.user_preferences);
        if (data.narration) setNarration(data.narration);
        if (data.next_blocks?.length === 3) setBlocks(data.next_blocks);
        if (data.session_summary !== undefined) setSessionSummary(data.session_summary);
        if (data.recent_blocks) setRecentBlocks(data.recent_blocks);
        setLastSelectedBlock(block);
        playSuccessSound();
        const nextTurn = turn + 1;
        setTurn(nextTurn);
        if (nextTurn > MAX_TURNS) setShowPlayButton(true);
      } catch {
        setError("Something went wrong. Try again!");
      } finally {
        setPipelineStage("idle");
        setLoading(false);
        processingRef.current = false;
      }
    },
    [genre, canvasState, preferences, loading, sessionSummary, recentBlocks, turn, ensureAudio]
  );

  const handlePlayNow = useCallback(() => {
    playClickSound();
    initGame();
    setScreen("play");
    setShowPlayButton(false);
  }, [initGame]);

  const handlePlayerUpdate = useCallback((_state: PlayerState) => {}, []);
  const handleCollision = useCallback((position: [number, number, number]) => checkCollisions(position), [checkCollisions]);

  const handleReset = useCallback(() => {
    playClickSound();
    stopAmbientLoop();
    audioStartedRef.current = false;
    setScreen("genre-select");
    setGenre(null);
    setCanvasState({ world: [], characters: [], theme: [], mood: [] });
    setPreferences({});
    setBlocks([]);
    setNarration("");
    setTurn(1);
    setSessionSummary("");
    setRecentBlocks([]);
    setShowInsights(false);
    setLastSelectedBlock(null);
    setShowConfetti(false);
    setShowPlayButton(false);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    playClickSound();
    setShowConfetti(false);
    initGame();
    setScreen("play");
  }, [initGame]);

  // ─── Genre select ───
  if (screen === "genre-select" || screen === "genre-switch") {
    return <GenrePicker onSelect={handleGenreSelect} isSwitch={screen === "genre-switch"} currentGenre={genre} />;
  }

  // ─── Win screen with score breakdown ───
  if (screen === "game-win") {
    const scores = calculateFinalScore(gameState);
    return (
      <div className="h-screen flex flex-col">
        <div className="absolute inset-0">
          <CreationCanvas canvasState={canvasState} genre={genre!} narration="" preferences={preferences}
            sessionSummary={sessionSummary} lastSelectedBlock={lastSelectedBlock} showConfetti={true} />
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full pointer-events-none">
          <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center pointer-events-auto animate-slide-up max-w-sm">
            <div className="text-5xl mb-2">🏆</div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
              YOU WIN!
            </h1>
            {/* Score breakdown */}
            <div className="bg-black/30 rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <span>Base Score</span>
                <span className="font-bold text-white">{scores.baseScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70 text-sm">
                <span>Time Bonus ({Math.floor(gameState.timer)}s × 50)</span>
                <span className="font-bold text-green-400">+{scores.timeBonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70 text-sm">
                <span>Best Combo (x{gameState.maxCombo} × 100)</span>
                <span className="font-bold text-purple-400">+{scores.comboBonus.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-yellow-400 font-extrabold text-lg">{scores.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleRetry}
                className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">
                Play Again
              </button>
              <button onClick={handleReset}
                className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">
                New World
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Lose screen ───
  if (screen === "game-lose") {
    return (
      <div className="h-screen flex flex-col">
        <div className="absolute inset-0 grayscale-[50%] brightness-75">
          <CreationCanvas canvasState={canvasState} genre={genre!} narration="" preferences={preferences}
            sessionSummary={sessionSummary} lastSelectedBlock={lastSelectedBlock} showConfetti={false} />
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full pointer-events-none">
          <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-8 border border-red-500/30 text-center pointer-events-auto animate-slide-up max-w-sm">
            <div className="text-5xl mb-2">⏰</div>
            <h1 className="text-3xl font-extrabold text-red-400 mb-2">
              TIME'S UP!
            </h1>
            <p className="text-white/50 text-sm mb-1">
              {gameState.objectivesCollected}/{gameState.objectivesTotal} collected
            </p>
            <p className="text-yellow-400 text-xl font-extrabold mb-4">
              {score.toLocaleString()} pts
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleRetry}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">
                Try Again
              </button>
              <button onClick={handleReset}
                className="px-5 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors">
                New World
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Play mode ───
  if (screen === "play") {
    return (
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-2 bg-black/40 backdrop-blur-sm border-b border-white/10 z-20 relative">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Play Mode
            </h1>
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold">{genre}</span>
          </div>
          <button onClick={handleReset} className="text-sm text-white/40 hover:text-white/70 font-semibold transition-colors">Exit</button>
        </header>
        <main className="flex-1 relative">
          <CreationCanvas
            canvasState={canvasState} genre={genre!} narration="" preferences={preferences}
            sessionSummary="" lastSelectedBlock={null} showConfetti={false}
            playMode={true} gameElements={elements} objective={objective}
            score={score} timer={gameState.timer} combo={gameState.combo}
            boosted={boosted} stunned={stunActive}
            gamePhase={gameState.phase} goalReady={gameState.goalReady}
            scorePopups={scorePopups} collectEffects={collectEffects}
            onRemoveCollectEffect={removeCollectEffect}
            onPlayerUpdate={handlePlayerUpdate} onCollision={handleCollision}
            countdownNumber={countdownNumber}
          />
        </main>
      </div>
    );
  }

  // ─── Build mode ───
  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Creative Engine</h1>
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{genre}</span>
          <ProgressBar current={turn} max={MAX_TURNS} />
          {turn > MAX_TURNS && <span className="text-green-600 text-xs font-bold animate-pulse">Build complete!</span>}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleGenreSwitch} className="text-sm text-purple-400 hover:text-purple-600 font-semibold transition-colors">Switch Genre</button>
          <button onClick={handleReset} className="text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors">Start Over</button>
        </div>
      </header>
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-red-500/90 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">{error}</div>
        </div>
      )}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 min-w-0">
          <CreationCanvas
            canvasState={canvasState} genre={genre!} narration={narration} preferences={preferences}
            sessionSummary={sessionSummary} lastSelectedBlock={lastSelectedBlock} showConfetti={false}
            showPlayButton={showPlayButton} onPlayNow={handlePlayNow}
          />
        </div>
        {turn <= MAX_TURNS && (
          <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
            <div className="flex-shrink-0">
              <AIInsightsPanel preferences={preferences} canvasState={canvasState} visible={showInsights} onToggle={() => setShowInsights((v) => !v)} />
            </div>
            <div className="flex-1 min-h-0">
              <IdeasWorkshop blocks={blocks} onSelectBlock={handleBlockSelect} loading={loading} turn={turn} pipelineStage={pipelineStage} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
