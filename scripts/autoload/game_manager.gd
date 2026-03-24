## GameManager — Global game state singleton.
## Manages score, timer, objectives, combos, and phase transitions.
extends Node

signal phase_changed(new_phase: StringName)
signal score_changed(new_score: int)
signal objective_progressed(current: int, total: int)
signal combo_changed(combo: int, multiplier: int)
signal time_warning(seconds_left: float)
signal boost_started(duration: float)
signal boost_ended()

enum Phase {
	MAIN_MENU,
	CHARACTER_SELECT,
	BUILDING,
	COUNTDOWN,
	PLAYING,
	PAUSED,
	WON,
	LOST,
}

# ── Current state ──
var phase: Phase = Phase.MAIN_MENU
var selected_character_id: String = ""
var selected_environment_id: String = ""

# ── Session data ──
var score: int = 0
var high_score: int = 0
var time_remaining: float = 45.0
var objectives_completed: int = 0
var objectives_total: int = 0
var combo: int = 0
var max_combo: int = 0
var multiplier: int = 1
var is_boosted: bool = false

# ── Internal ──
var _boost_timer: float = 0.0
var _combo_decay_timer: float = 0.0

const STARTING_TIME := 45.0
const COMBO_WINDOW := 3.0
const COLLECT_TIME_BONUS := 3.0
const OBSTACLE_TIME_PENALTY := 5.0
const TIME_BONUS_PER_SECOND := 50
const COMBO_BONUS_PER_LEVEL := 100
const LOW_TIME_THRESHOLD := 10.0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS


func _process(delta: float) -> void:
	if phase != Phase.PLAYING:
		return

	# Timer
	time_remaining -= delta
	if time_remaining <= LOW_TIME_THRESHOLD and time_remaining > 0:
		time_warning.emit(time_remaining)
	if time_remaining <= 0.0:
		time_remaining = 0.0
		change_phase(Phase.LOST)
		return

	# Boost countdown
	if is_boosted:
		_boost_timer -= delta
		if _boost_timer <= 0.0:
			_end_boost()

	# Combo decay
	_combo_decay_timer += delta
	if _combo_decay_timer >= COMBO_WINDOW and combo > 0:
		combo = 0
		_update_multiplier()
		combo_changed.emit(combo, multiplier)
		_combo_decay_timer = 0.0


func change_phase(new_phase: Phase) -> void:
	var old_phase := phase
	phase = new_phase
	phase_changed.emit(_phase_name(new_phase))

	match new_phase:
		Phase.COUNTDOWN:
			_prepare_game()
		Phase.PLAYING:
			pass
		Phase.PAUSED:
			get_tree().paused = true
		Phase.WON:
			high_score = max(high_score, _calculate_total_score())
		Phase.LOST:
			pass

	if old_phase == Phase.PAUSED:
		get_tree().paused = false


func _prepare_game() -> void:
	score = 0
	time_remaining = STARTING_TIME
	objectives_completed = 0
	combo = 0
	max_combo = 0
	multiplier = 1
	is_boosted = false
	_boost_timer = 0.0
	_combo_decay_timer = 0.0
	score_changed.emit(score)
	combo_changed.emit(combo, multiplier)


func collect_item(value: int) -> int:
	combo += 1
	max_combo = max(max_combo, combo)
	_combo_decay_timer = 0.0
	_update_multiplier()

	var points := value * multiplier
	score += points
	time_remaining += COLLECT_TIME_BONUS

	score_changed.emit(score)
	combo_changed.emit(combo, multiplier)
	return points


func complete_objective() -> void:
	objectives_completed += 1
	objective_progressed.emit(objectives_completed, objectives_total)

	if objectives_completed >= objectives_total:
		# Don't win yet — player must reach the goal
		pass


func hit_obstacle() -> void:
	time_remaining = max(0.0, time_remaining - OBSTACLE_TIME_PENALTY)
	combo = 0
	_update_multiplier()
	combo_changed.emit(combo, multiplier)


func start_boost(duration: float) -> void:
	is_boosted = true
	_boost_timer = duration
	boost_started.emit(duration)


func _end_boost() -> void:
	is_boosted = false
	_boost_timer = 0.0
	boost_ended.emit()


func reach_goal() -> void:
	if objectives_completed >= objectives_total:
		change_phase(Phase.WON)


func _update_multiplier() -> void:
	multiplier = clampi(floori(combo / 3.0) + 1, 1, 5)


func _calculate_total_score() -> int:
	var time_bonus := int(max(0.0, time_remaining)) * TIME_BONUS_PER_SECOND
	var combo_bonus := max_combo * COMBO_BONUS_PER_LEVEL
	return score + time_bonus + combo_bonus


func get_score_breakdown() -> Dictionary:
	var time_bonus := int(max(0.0, time_remaining)) * TIME_BONUS_PER_SECOND
	var combo_bonus := max_combo * COMBO_BONUS_PER_LEVEL
	return {
		"base": score,
		"time_bonus": time_bonus,
		"combo_bonus": combo_bonus,
		"total": score + time_bonus + combo_bonus,
		"time_left": time_remaining,
		"max_combo": max_combo,
	}


func reset() -> void:
	phase = Phase.MAIN_MENU
	selected_character_id = ""
	selected_environment_id = ""
	score = 0
	time_remaining = STARTING_TIME
	objectives_completed = 0
	objectives_total = 0
	combo = 0
	max_combo = 0
	multiplier = 1
	is_boosted = false


func _phase_name(p: Phase) -> StringName:
	match p:
		Phase.MAIN_MENU: return &"main_menu"
		Phase.CHARACTER_SELECT: return &"character_select"
		Phase.BUILDING: return &"building"
		Phase.COUNTDOWN: return &"countdown"
		Phase.PLAYING: return &"playing"
		Phase.PAUSED: return &"paused"
		Phase.WON: return &"won"
		Phase.LOST: return &"lost"
	return &"unknown"
