## MainMenu — Title screen with Play and Quit buttons.
extends Control

@onready var play_button: Button = $VBoxContainer/PlayButton
@onready var quit_button: Button = $VBoxContainer/QuitButton
@onready var title_label: Label = $VBoxContainer/TitleLabel


func _ready() -> void:
	play_button.pressed.connect(_on_play)
	quit_button.pressed.connect(_on_quit)
	# Entrance animation
	modulate.a = 0.0
	var tween := create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.5)


func _on_play() -> void:
	AudioManager.play_click()
	GameManager.change_phase(GameManager.Phase.COUNTDOWN)
	get_tree().change_scene_to_file("res://scenes/game/game_world.tscn")


func _on_quit() -> void:
	get_tree().quit()
