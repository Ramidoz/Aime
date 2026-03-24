## Obstacle — Static or moving hazard that penalizes the player.
extends Node3D

@export var is_moving: bool = false
@export var move_amplitude: float = 2.0
@export var move_speed: float = 1.0

var _start_pos: Vector3
var _time: float = 0.0

@onready var area: Area3D = $Area3D


func _ready() -> void:
	area.add_to_group("obstacles")
	_start_pos = position
	_time = randf() * TAU


func _process(delta: float) -> void:
	if is_moving:
		_time += delta
		position.x = _start_pos.x + sin(_time * move_speed) * move_amplitude
