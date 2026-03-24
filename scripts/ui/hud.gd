## HUD — In-game heads-up display showing score, timer, objectives, combo.
extends CanvasLayer

@onready var score_label: Label = $ScoreLabel
@onready var timer_label: Label = $TimerLabel
@onready var objective_label: Label = $ObjectiveLabel
@onready var combo_label: Label = $ComboLabel
@onready var countdown_label: Label = $CountdownLabel

var _countdown_value: int = 3


func _ready() -> void:
	GameManager.score_changed.connect(_on_score_changed)
	GameManager.combo_changed.connect(_on_combo_changed)
	GameManager.objective_progressed.connect(_on_objective_progressed)
	GameManager.phase_changed.connect(_on_phase_changed)

	combo_label.visible = false
	countdown_label.visible = false
	_update_timer()
	_update_objective()


func _process(_delta: float) -> void:
	if GameManager.phase == GameManager.Phase.PLAYING:
		_update_timer()


func _update_timer() -> void:
	var secs := ceili(GameManager.time_remaining)
	timer_label.text = "%ds" % secs
	if GameManager.time_remaining <= 5.0:
		timer_label.add_theme_color_override("font_color", Color.RED)
	elif GameManager.time_remaining <= 10.0:
		timer_label.add_theme_color_override("font_color", Color.ORANGE)
	else:
		timer_label.add_theme_color_override("font_color", Color.WHITE)


func _update_objective() -> void:
	if GameManager.objectives_completed >= GameManager.objectives_total:
		objective_label.text = "REACH THE GOAL!"
	else:
		objective_label.text = "%d / %d" % [GameManager.objectives_completed, GameManager.objectives_total]


func _on_score_changed(new_score: int) -> void:
	score_label.text = str(new_score)
	# Punch animation
	var tween := create_tween()
	tween.tween_property(score_label, "scale", Vector2(1.3, 1.3), 0.08)
	tween.tween_property(score_label, "scale", Vector2.ONE, 0.15)


func _on_combo_changed(combo: int, multiplier: int) -> void:
	if combo >= 2:
		combo_label.visible = true
		combo_label.text = "x%d COMBO!" % combo
		var tween := create_tween()
		tween.tween_property(combo_label, "scale", Vector2(1.4, 1.4), 0.1)
		tween.tween_property(combo_label, "scale", Vector2.ONE, 0.2)
	else:
		combo_label.visible = false


func _on_objective_progressed(current: int, total: int) -> void:
	_update_objective()


func _on_phase_changed(new_phase: StringName) -> void:
	match new_phase:
		&"countdown":
			_start_countdown()
		&"won":
			_show_results("YOU WIN!", Color.GREEN)
		&"lost":
			_show_results("TIME'S UP!", Color.RED)


func _start_countdown() -> void:
	countdown_label.visible = true
	_countdown_value = 3
	countdown_label.text = "3"

	for i in range(3):
		await get_tree().create_timer(0.8).timeout
		_countdown_value -= 1
		if _countdown_value > 0:
			countdown_label.text = str(_countdown_value)
		else:
			countdown_label.text = "GO!"

	await get_tree().create_timer(0.5).timeout
	countdown_label.visible = false
	GameManager.change_phase(GameManager.Phase.PLAYING)


func _show_results(title: String, color: Color) -> void:
	# Placeholder — in full game this transitions to a results scene
	countdown_label.visible = true
	countdown_label.text = title
	countdown_label.add_theme_color_override("font_color", color)
