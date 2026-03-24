## EnvironmentData — Defines a level environment theme.
extends Resource
class_name EnvironmentData

@export var id: String = ""
@export var display_name: String = ""

@export_group("Sky")
@export var sky_top_color: Color = Color(0.3, 0.5, 0.9)
@export var sky_bottom_color: Color = Color(0.7, 0.85, 1.0)

@export_group("Ground")
@export var ground_color: Color = Color(0.2, 0.6, 0.2)
@export var grid_color: Color = Color(0.3, 0.7, 0.3)

@export_group("Lighting")
@export var ambient_color: Color = Color(0.6, 0.65, 0.7)
@export var ambient_energy: float = 0.5
@export var sun_color: Color = Color.WHITE
@export var sun_energy: float = 1.0
@export var sun_rotation: Vector3 = Vector3(-45, 30, 0)

@export_group("Fog")
@export var fog_enabled: bool = false
@export var fog_color: Color = Color(0.7, 0.8, 0.9)
@export var fog_density: float = 0.01

@export_group("Audio")
@export var music_track: String = ""
