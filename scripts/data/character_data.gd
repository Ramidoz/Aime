## CharacterData — Defines a playable character's appearance and feel.
extends Resource
class_name CharacterData

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""

@export_group("Visuals")
@export var body_color: Color = Color.CORNFLOWER_BLUE
@export var accent_color: Color = Color.WHITE
@export var eye_style: String = "round" ## round, cat, led, big

@export_group("Movement Feel")
@export var move_speed: float = 8.0
@export var jump_force: float = 12.0
@export var bob_speed: float = 3.0
@export var bob_amount: float = 0.15
@export var squash_amount: float = 0.3

@export_group("Audio")
@export var jump_pitch: float = 1.0
@export var collect_pitch: float = 1.0
