## ResultsScreen — Score breakdown shown after win or loss.
extends Control

@onready var title_label: Label = $Panel/VBox/TitleLabel
@onready var base_score_label: Label = $Panel/VBox/BaseScore
@onready var time_bonus_label: Label = $Panel/VBox/TimeBonus
@onready var combo_bonus_label: Label = $Panel/VBox/ComboBonus
@onready var total_label: Label = $Panel/VBox/TotalLabel
@onready var retry_button: Button = $Panel/VBox/HBox/RetryButton
@onready var menu_button: Button = $Panel/VBox/HBox/MenuButton


func _ready() -> void:
	retry_button.pressed.connect(_on_retry)
	menu_button.pressed.connect(_on_menu)
	_populate()

	# Slide in
	modulate.a = 0.0
	var tween := create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.4).set_delay(0.5)


func _populate() -> void:
	var breakdown := GameManager.get_score_breakdown()
	var won := GameManager.phase == GameManager.Phase.WON

	title_label.text = "YOU WIN!" if won else "TIME'S UP!"
	title_label.add_theme_color_override("font_color", Color.GOLD if won else Color.RED)

	base_score_label.text = "Base Score: %d" % breakdown.base
	time_bonus_label.text = "Time Bonus: +%d" % breakdown.time_bonus
	combo_bonus_label.text = "Combo Bonus: +%d" % breakdown.combo_bonus
	total_label.text = "TOTAL: %d" % breakdown.total


func _on_retry() -> void:
	AudioManager.play_click()
	GameManager.change_phase(GameManager.Phase.COUNTDOWN)
	get_tree().reload_current_scene()


func _on_menu() -> void:
	AudioManager.play_click()
	GameManager.reset()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
