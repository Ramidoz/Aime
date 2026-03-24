## Collectible — Spinning, floating item that awards score on touch.
extends Node3D

signal collected(value: int)

@export var value: int = 100
@export var collectible_type: String = "star" ## star, coin, gem

var is_collected: bool = false
var _time: float = 0.0

@onready var mesh_pivot: Node3D = $MeshPivot
@onready var area: Area3D = $Area3D


func _ready() -> void:
	area.add_to_group("collectibles")
	# Randomize start phase so they don't all bob in sync
	_time = randf() * TAU


func _process(delta: float) -> void:
	if is_collected:
		return
	_time += delta
	# Float
	mesh_pivot.position.y = sin(_time * 2.0) * 0.15
	# Spin
	mesh_pivot.rotation.y += delta * 2.0


func collect() -> void:
	if is_collected:
		return
	is_collected = true

	var points := GameManager.collect_item(value)
	GameManager.complete_objective()
	collected.emit(points)

	AudioManager.play_collect(GameManager.combo)

	# Collect animation: scale up then vanish
	var tween := create_tween()
	tween.tween_property(mesh_pivot, "scale", Vector3.ONE * 1.5, 0.1).set_ease(Tween.EASE_OUT)
	tween.parallel().tween_property(mesh_pivot, "position:y", mesh_pivot.position.y + 1.0, 0.25).set_ease(Tween.EASE_OUT)
	tween.tween_property(mesh_pivot, "scale", Vector3.ZERO, 0.15).set_ease(Tween.EASE_IN)
	tween.tween_callback(queue_free)
