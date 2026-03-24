## Goal — Portal that triggers win when all objectives are collected.
extends Node3D

var is_unlocked: bool = false
var _time: float = 0.0

@onready var area: Area3D = $Area3D
@onready var mesh_pivot: Node3D = $MeshPivot
@onready var lock_indicator: Node3D = $LockIndicator


func _ready() -> void:
	area.add_to_group("goal")
	GameManager.objective_progressed.connect(_on_objective_progressed)
	_update_visual()


func _process(delta: float) -> void:
	_time += delta
	if mesh_pivot:
		mesh_pivot.rotation.y += delta * (1.5 if is_unlocked else 0.3)

	# Pulse when unlocked
	if is_unlocked and mesh_pivot:
		var pulse := 1.0 + sin(_time * 3.0) * 0.08
		mesh_pivot.scale = Vector3.ONE * pulse


func _on_objective_progressed(current: int, total: int) -> void:
	is_unlocked = current >= total
	_update_visual()


func _update_visual() -> void:
	if lock_indicator:
		lock_indicator.visible = not is_unlocked
	# Change color: gray when locked, green when ready
	if mesh_pivot and mesh_pivot.get_child_count() > 0:
		var mesh := mesh_pivot.get_child(0) as MeshInstance3D
		if mesh:
			var mat := mesh.get_surface_override_material(0) as StandardMaterial3D
			if mat:
				if is_unlocked:
					mat.albedo_color = Color(0.2, 1.0, 0.5)
					mat.emission = Color(0.0, 1.0, 0.4)
					mat.emission_energy_multiplier = 1.5
				else:
					mat.albedo_color = Color(0.3, 0.3, 0.3)
					mat.emission = Color(0.1, 0.1, 0.1)
					mat.emission_energy_multiplier = 0.2
