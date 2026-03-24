## BoostPad — Ground pad that speeds the player up for a duration.
extends Node3D

@export var duration: float = 3.0
var _time: float = 0.0

@onready var area: Area3D = $Area3D
@onready var mesh: MeshInstance3D = $Mesh


func _ready() -> void:
	area.add_to_group("boost_pads")


func _process(delta: float) -> void:
	_time += delta
	# Pulsing glow
	if mesh and mesh.get_surface_override_material(0):
		var mat: StandardMaterial3D = mesh.get_surface_override_material(0)
		mat.emission_energy_multiplier = 1.0 + sin(_time * 4.0) * 0.5
