## GameWorld — Main gameplay scene. Generates a level and manages play session.
extends Node3D

const CollectibleScene := preload("res://scenes/game/collectible.tscn")
const BoostPadScene := preload("res://scenes/game/boost_pad.tscn")
const ObstacleScene := preload("res://scenes/game/obstacle.tscn")
const GoalScene := preload("res://scenes/game/goal.tscn")

@onready var player: CharacterBody3D = $Player
@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera: Camera3D = $CameraPivot/Camera3D
@onready var hud: CanvasLayer = $HUD
@onready var elements_container: Node3D = $Elements

# Camera settings
var cam_distance := 6.0
var cam_height := 4.0
var cam_smooth := 0.08
var cam_look_ahead := 1.5


func _ready() -> void:
	# Generate level
	var level := LevelGenerator.generate(5, 2, 3)

	# Set objectives count
	GameManager.objectives_total = level.collectibles.size()

	# Spawn player
	player.global_position = level.spawn

	# Spawn collectibles
	for data in level.collectibles:
		var c := CollectibleScene.instantiate()
		c.position = data.position
		c.value = data.value
		c.collectible_type = data.type
		elements_container.add_child(c)

	# Spawn boosts
	for data in level.boosts:
		var b := BoostPadScene.instantiate()
		b.position = data.position
		b.duration = data.duration
		elements_container.add_child(b)

	# Spawn obstacles
	for data in level.obstacles:
		var o := ObstacleScene.instantiate()
		o.position = data.position
		o.is_moving = data.is_moving
		o.move_amplitude = data.amplitude
		o.move_speed = data.speed
		elements_container.add_child(o)

	# Spawn goal
	var g := GoalScene.instantiate()
	g.position = level.goal
	elements_container.add_child(g)

	# Start countdown
	GameManager.change_phase(GameManager.Phase.COUNTDOWN)


func _process(delta: float) -> void:
	_update_camera(delta)


func _update_camera(delta: float) -> void:
	if not player:
		return
	var target_pos := player.global_position
	var behind := -player.global_transform.basis.z * cam_distance
	var ideal := target_pos + behind + Vector3(0, cam_height, 0)

	camera_pivot.global_position = camera_pivot.global_position.lerp(ideal, cam_smooth)

	# Look ahead of player
	var look_target := target_pos + player.global_transform.basis.z * cam_look_ahead
	look_target.y = target_pos.y + 0.5
	camera.look_at(look_target, Vector3.UP)

	# Dynamic FOV when boosted
	var target_fov := 62.0 if GameManager.is_boosted else 50.0
	camera.fov = lerp(camera.fov, target_fov, 0.06)
