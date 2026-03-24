"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Genre, Block, CanvasState, UserPreferences,
  BlocksResponse, InteractionResponse, PlayerState,
} from "@/types";
import GenrePicker from "@/components/GenrePicker";
import CreationCanvas from "@/components/CreationCanvas";
import IdeasWorkshop from "@/components/IdeasWorkshop";
import { useGameManager } from "@/hooks/useGameManager";
import { calculateFinalScore } from "@/game/GameState";
import {
  ConversationStage, ChoiceOption,
  getSettingOptions, getCharacterOptions, getGoalOptions,
  getCosmoReaction,
} from "@/game/ConversationFlow";
import { CosmoEmotion } from "@/components/Cosmo";
import {
  playClickSound, playSuccessSound, playSpawnSound,
  playCompletionSound, startAmbientLoop, stopAmbientLoop,
} from "@/utils/audio";

type AppScreen = "genre-select" | "create" | "play" | "game-win" | "game-lose";

const MAX_TURNS = 4;

export default function Home() {
  // ─── Core state ───
  const [screen, setScreen] = useState<AppScreen>("genre-select");
  const [genre, setGenre] = useState<Genre | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({ world: [], characters: [], theme: [], mood: [] });
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(1);
  const [pipelineStage, setPipelineStage] = useState("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState("");
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [lastSelectedBlock, setLastSelectedBlock] = useState<Block | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // ─── Conversation state ───
  const [convoStage, setConvoStage] = useState<ConversationStage>("welcome");
  const [cosmoMessage, setCosmoMessage] = useState("Welcome, Creator! Pick a world and let's build!");
  const [cosmoEmotion, setCosmoEmotion] = useState<CosmoEmotion>("happy");
  const [choices, setChoices] = useState<ChoiceOption[]>([]);
  const [convoContext, setConvoContext] = useState({
    setting: null as string | null,
    character: null as string | null,
    goal: null as string | null,
  });
  const [showBlocks, setShowBlocks] = useState(false);
  const [showLaunchReady, setShowLaunchReady] = useState(false);

  const processingRef = useRef(false);
  const audioStartedRef = useRef(false);

  // ─── Game manager ───
  const {
    elements, gameState, objective, score, boosted, damaged,
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
  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 4000); return () => clearTimeout(t); } }, [error]);

  // Win/Lose detection
  useEffect(() => {
    if (gameWon && screen === "play") {
      setTimeout(() => { setShowConfetti(true); setScreen("game-win"); playCompletionSound(); }, 600);
    }
  }, [gameWon, screen]);
  useEffect(() => {
    if (gameLost && screen === "play") {
      setTimeout(() => setScreen("game-lose"), 300);
    }
  }, [gameLost, screen]);

  // ─── Genre selection → start conversation ───
  const handleGenreSelect = useCallback((selectedGenre: Genre) => {
    ensureAudio();
    playClickSound();
    setGenre(selectedGenre);
    setScreen("create");
    setShowConfetti(false);
    setError(null);
    setCanvasState({ world: [], characters: [], theme: [], mood: [] });
    setNarration("");
    setBlocks([]);
    setTurn(1);
    setLastSelectedBlock(null);
    setShowBlocks(false);
    setShowLaunchReady(false);
    setConvoContext({ setting: null, character: null, goal: null });

    // Start conversation: choose setting
    setConvoStage("choose_setting");
    setCosmoEmotion("excited");
    setCosmoMessage(`Awesome! A ${selectedGenre} world! Where should it happen?`);
    setChoices(getSettingOptions(selectedGenre));
  }, [ensureAudio]);

  // ─── Conversation choice handler ───
  const handleChoice = useCallback((choice: ChoiceOption) => {
    if (!genre) return;
    ensureAudio();
    playClickSound();

    // Apply effects to canvas state
    setCanvasState((prev) => {
      const next = { ...prev };
      if (choice.worldEffect) next.world = [...next.world, choice.worldEffect];
      if (choice.characterEffect) next.characters = [...next.characters, choice.characterEffect];
      if (choice.themeEffect) next.theme = [...next.theme, choice.themeEffect];
      if (choice.moodEffect) next.mood = [...next.mood, choice.moodEffect];
      return next;
    });

    playSpawnSound();

    if (convoStage === "choose_setting") {
      setConvoContext((prev) => ({ ...prev, setting: choice.label }));
      setCosmoEmotion("happy");
      setCosmoMessage(`Ooh, ${choice.label} — love it! Now, who's the star of the show?`);
      setChoices(getCharacterOptions(genre));
      setConvoStage("choose_character");
    } else if (convoStage === "choose_character") {
      setConvoContext((prev) => ({ ...prev, character: choice.label }));
      setCosmoEmotion("excited");
      setCosmoMessage(`${choice.label} is SO cool! What's their mission?`);
      setChoices(getGoalOptions());
      setConvoStage("choose_goal");
    } else if (convoStage === "choose_goal") {
      setConvoContext((prev) => ({ ...prev, goal: choice.label }));
      setCosmoEmotion("encouraging");
      setCosmoMessage("Your world is taking shape! Pick an idea to add more cool stuff!");
      setChoices([]);
      setConvoStage("building");
      setShowBlocks(true);
      // Fetch AI-generated blocks
      fetchInitialBlocks(genre, preferences, sessionSummary, recentBlocks);
    }
  }, [genre, convoStage, ensureAudio, preferences, sessionSummary, recentBlocks]);

  // ─── Block fetching ───
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

  // ─── Block selection (AI building turns) ───
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
        if (nextTurn > MAX_TURNS) {
          setShowLaunchReady(true);
          setShowBlocks(false);
          setConvoStage("ready_to_launch");
          setCosmoEmotion("excited");
          setCosmoMessage("WOW! Your creation looks AMAZING! Ready to play it?");
        } else {
          setCosmoEmotion("happy");
          const reactions = ["Ooh, great choice!", "I love it!", "That's going to be so cool!", "Perfect pick!"];
          setCosmoMessage(reactions[Math.floor(Math.random() * reactions.length)] + " Keep adding more!");
        }
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

  // ─── Launch to play ───
  const handleLaunch = useCallback(() => {
    playClickSound();
    initGame();
    setScreen("play");
    setShowLaunchReady(false);
  }, [initGame]);

  const handlePlayerUpdate = useCallback((_state: PlayerState) => {}, []);
  const handleCollision = useCallback((pos: [number, number, number]) => checkCollisions(pos), [checkCollisions]);

  // ─── Reset ───
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
    setLastSelectedBlock(null);
    setShowConfetti(false);
    setShowBlocks(false);
    setShowLaunchReady(false);
    setError(null);
    setConvoStage("welcome");
    setConvoContext({ setting: null, character: null, goal: null });
    setChoices([]);
    setCosmoMessage("Welcome, Creator! Pick a world and let's build!");
    setCosmoEmotion("happy");
  }, []);

  const handleRetry = useCallback(() => {
    playClickSound();
    setShowConfetti(false);
    initGame();
    setScreen("play");
  }, [initGame]);

  // ─── Screens ───

  if (screen === "genre-select") {
    return <GenrePicker onSelect={handleGenreSelect} currentGenre={genre} />;
  }

  // Win screen
  if (screen === "game-win") {
    const scores = calculateFinalScore(gameState);
    return (
      <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)" }}>
        <div className="absolute inset-0">
          <CreationCanvas canvasState={canvasState} genre={genre!} narration="" preferences={preferences}
            sessionSummary={sessionSummary} lastSelectedBlock={lastSelectedBlock} showConfetti={true} />
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full pointer-events-none">
          <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center pointer-events-auto animate-slide-up max-w-sm">
            <div className="text-5xl mb-2">🏆</div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">YOU WIN!</h1>
            <div className="bg-black/30 rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between text-white/70 text-sm"><span>Base Score</span><span className="font-bold text-white">{scores.baseScore.toLocaleString()}</span></div>
              <div className="flex justify-between text-white/70 text-sm"><span>Time Bonus</span><span className="font-bold text-green-400">+{scores.timeBonus.toLocaleString()}</span></div>
              <div className="flex justify-between text-white/70 text-sm"><span>Combo Bonus</span><span className="font-bold text-purple-400">+{scores.comboBonus.toLocaleString()}</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between"><span className="text-white font-bold">Total</span><span className="text-yellow-400 font-extrabold text-lg">{scores.total.toLocaleString()}</span></div>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleRetry} className="launch-btn text-sm px-5 py-2">Play Again</button>
              <button onClick={handleReset} className="action-bar-btn">New World</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lose screen
  if (screen === "game-lose") {
    return (
      <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)" }}>
        <div className="absolute inset-0 grayscale-[50%] brightness-75">
          <CreationCanvas canvasState={canvasState} genre={genre!} narration="" preferences={preferences}
            sessionSummary={sessionSummary} lastSelectedBlock={lastSelectedBlock} showConfetti={false} />
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full pointer-events-none">
          <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-8 border border-red-500/30 text-center pointer-events-auto animate-slide-up max-w-sm">
            <div className="text-5xl mb-2">⏰</div>
            <h1 className="text-3xl font-extrabold text-red-400 mb-2">TIME'S UP!</h1>
            <p className="text-white/50 text-sm mb-1">{gameState.objectivesCollected}/{gameState.objectivesTotal} collected</p>
            <p className="text-yellow-400 text-xl font-extrabold mb-4">{score.toLocaleString()} pts</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleRetry} className="choice-btn choice-btn--orange text-sm" style={{ minHeight: "auto", padding: "12px 24px" }}>
                <span className="choice-btn-shadow" /><span className="choice-btn__label">Try Again</span>
              </button>
              <button onClick={handleReset} className="action-bar-btn">New World</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Play mode
  if (screen === "play") {
    return (
      <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)" }}>
        <header className="flex items-center justify-between px-6 py-2 bg-black/50 backdrop-blur-sm border-b border-white/10 z-20 relative">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-green-400">Playing</span>
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold">{genre}</span>
          </div>
          <button onClick={handleReset} className="action-bar-btn text-xs">Exit</button>
        </header>
        <main className="flex-1 relative">
          <CreationCanvas
            canvasState={canvasState} genre={genre!} narration="" preferences={preferences}
            sessionSummary="" lastSelectedBlock={null} showConfetti={false}
            playMode={true} gameElements={elements} objective={objective}
            score={score} timer={gameState.timer} combo={gameState.combo}
            boosted={boosted} stunned={stunActive} damaged={damaged}
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

  // ─── Create mode (Cosmo conversation + canvas) ───
  return (
    <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2 bg-black/30 backdrop-blur-sm border-b border-white/10 z-20 relative">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Creation Universe
          </h1>
          <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs font-bold border border-white/10">{genre}</span>
        </div>
        <button onClick={handleReset} className="action-bar-btn text-xs">Start Over</button>
      </header>

      {/* Error toast */}
      {error && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-red-500/90 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">{error}</div>
        </div>
      )}

      {/* Two-panel layout */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left: Ideas Workshop */}
        <div className="w-[380px] flex-shrink-0">
          <IdeasWorkshop
            cosmoMessage={cosmoMessage}
            cosmoEmotion={cosmoEmotion}
            choices={choices}
            onChoice={handleChoice}
            isThinking={loading && !showBlocks}
            blocks={blocks}
            onSelectBlock={handleBlockSelect}
            showBlocks={showBlocks}
            loading={loading}
            pipelineStage={pipelineStage}
            turn={turn}
            showLaunchReady={showLaunchReady}
            onLaunch={handleLaunch}
          />
        </div>

        {/* Right: Creation Canvas */}
        <div className="flex-1 min-w-0">
          <CreationCanvas
            canvasState={canvasState} genre={genre!} narration={narration} preferences={preferences}
            sessionSummary={sessionSummary} lastSelectedBlock={lastSelectedBlock} showConfetti={false}
          />
        </div>
      </main>

      {/* Bottom action bar */}
      <div className="action-bar">
        <div className="flex items-center gap-2">
          <button className="action-bar-btn">🎒 Inventory</button>
          <button className="action-bar-btn">📁 My Creations</button>
        </div>
        {showLaunchReady && (
          <button onClick={handleLaunch} className="launch-btn launch-btn--ready text-sm px-6 py-2">
            🚀 Launch & Play!
          </button>
        )}
      </div>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
