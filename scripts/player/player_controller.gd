## PlayerController — CharacterBody3D with momentum, jump, squash/stretch.
extends CharacterBody3D

signal collected_item(value: int)
signal hit_obstacle()
signal entered_boost(duration: float)
signal reached_goal()

@export var character_data: CharacterData

# Movement
var move_speed: float = 8.0
var boost_speed: float = 16.0
var acceleration: float = 20.0
var friction: float = 15.0
var rotation_speed: float = 10.0

# Jump
var jump_force: float = 12.0
var gravity: float = 30.0

# State
var is_boosted: bool = false
var is_stunned: bool = false
var stun_timer: float = 0.0

# Squash/stretch
var _squash: float = 1.0
var _squash_target: float = 1.0
var _was_on_floor: bool = true

@onready var mesh: Node3D = $Mesh
@onready var collect_area: Area3D = $CollectArea


func _ready() -> void:
	if character_data:
		move_speed = character_data.move_speed
		jump_force = character_data.jump_force
	collect_area.area_entered.connect(_on_area_entered)
	GameManager.boost_ended.connect(_on_boost_ended)


func _physics_process(delta: float) -> void:
	if GameManager.phase != GameManager.Phase.PLAYING:
		return

	# Stun
	if is_stunned:
		stun_timer -= delta
		if stun_timer <= 0.0:
			is_stunned = false
		_apply_stun_visual(delta)
		move_and_slide()
		return

	# Input
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	var direction := Vector3(input_dir.x, 0.0, input_dir.y).normalized()
	var speed := boost_speed if is_boosted else move_speed

	# Horizontal movement
	if direction.length() > 0.1:
		var target_vel := direction * speed
		velocity.x = move_toward(velocity.x, target_vel.x, acceleration * delta)
		velocity.z = move_toward(velocity.z, target_vel.z, acceleration * delta)
		# Face movement direction
		var target_rot := atan2(direction.x, direction.z)
		rotation.y = lerp_angle(rotation.y, target_rot, rotation_speed * delta)
	else:
		velocity.x = move_toward(velocity.x, 0.0, friction * delta)
		velocity.z = move_toward(velocity.z, 0.0, friction * delta)

	# Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_force
		_squash_target = 0.7
		AudioManager.play_click()

	# Landing detection
	if is_on_floor() and not _was_on_floor and velocity.y < -2.0:
		_squash_target = 1.3
	_was_on_floor = is_on_floor()

	# Squash/stretch animation
	_squash = lerp(_squash, 1.0, 10.0 * delta)
	if absf(_squash_target - 1.0) > 0.01:
		_squash = lerp(_squash, _squash_target, 15.0 * delta)
		if absf(_squash - _squash_target) < 0.05:
			_squash_target = 1.0

	if mesh:
		var inv := 1.0 / sqrt(_squash)
		mesh.scale = Vector3(inv, _squash, inv)

	move_and_slide()


func apply_stun(duration: float) -> void:
	is_stunned = true
	stun_timer = duration
	velocity = Vector3.ZERO


func _apply_stun_visual(delta: float) -> void:
	if mesh:
		var flash := sin(Time.get_ticks_msec() * 0.02) > 0.0
		mesh.visible = flash


func _on_area_entered(area: Area3D) -> void:
	if area.is_in_group("collectibles"):
		var collectible := area.get_parent()
		if collectible.has_method("collect"):
			collectible.collect()
			collected_item.emit(collectible.value if "value" in collectible else 100)

	elif area.is_in_group("boost_pads"):
		is_boosted = true
		var duration: float = 3.0
		if "duration" in area.get_parent():
			duration = area.get_parent().duration
		GameManager.start_boost(duration)
		entered_boost.emit(duration)

	elif area.is_in_group("obstacles"):
		GameManager.hit_obstacle()
		apply_stun(0.4)
		AudioManager.play_hit()
		hit_obstacle.emit()

	elif area.is_in_group("goal"):
		GameManager.reach_goal()
		reached_goal.emit()


func _on_boost_ended() -> void:
	is_boosted = false
