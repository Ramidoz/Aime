## LevelGenerator — Builds a level by placing elements along a smooth path.
extends Node
class_name LevelGenerator

const MIN_SPACING := 2.5
const PATH_SPREAD := 2.5

## Generate a full level layout.
## Returns a dictionary with spawn, goal, and element arrays.
static func generate(objectives_count: int = 5, boosts_count: int = 2, obstacles_count: int = 3, seed_value: int = 0) -> Dictionary:
	if seed_value == 0:
		seed_value = randi()
	seed(seed_value)

	var path := _generate_path(20)
	var spawn_pos: Vector3 = path[0]
	var goal_pos: Vector3 = path[path.size() - 1]

	var collectibles: Array[Dictionary] = []
	var boosts: Array[Dictionary] = []
	var obstacles: Array[Dictionary] = []

	# Place collectibles spread along the path
	for i in range(objectives_count):
		var t := float(i + 1) / float(objectives_count + 1)
		var pos := _point_along_path(path, t, randf_range(-PATH_SPREAD, PATH_SPREAD))
		pos.y = 0.5
		collectibles.append({
			"position": pos,
			"type": ["star", "coin", "gem"][randi() % 3],
			"value": [100, 50, 200][randi() % 3],
		})

	# Place boost pads
	for i in range(boosts_count):
		var t := float(i + 1) / float(boosts_count + 1)
		var pos := _point_along_path(path, t, randf_range(-1.0, 1.0))
		pos.y = 0.05
		boosts.append({"position": pos, "duration": 3.0})

	# Place obstacles in the middle section
	for i in range(obstacles_count):
		var t := 0.25 + randf() * 0.5
		var pos := _point_along_path(path, t, randf_range(-3.0, 3.0))
		pos.y = 0.0
		var is_moving := randf() > 0.6
		obstacles.append({
			"position": pos,
			"is_moving": is_moving,
			"amplitude": randf_range(1.5, 3.0),
			"speed": randf_range(0.8, 1.5),
		})

	return {
		"spawn": spawn_pos + Vector3(0, 0.5, 0),
		"goal": goal_pos,
		"path": path,
		"collectibles": collectibles,
		"boosts": boosts,
		"obstacles": obstacles,
	}


static func _generate_path(num_points: int) -> Array[Vector3]:
	var points: Array[Vector3] = []
	var x := 0.0
	var z := 0.0
	points.append(Vector3(x, 0.0, z))

	for i in range(1, num_points):
		z -= 2.0 + randf() * 2.0
		x += (randf() - 0.5) * 4.0
		var y := sin(i * 0.5) * 0.3
		points.append(Vector3(x, y, z))

	return points


static func _point_along_path(path: Array[Vector3], t: float, lateral: float) -> Vector3:
	var idx := clampi(int(t * (path.size() - 1)), 0, path.size() - 2)
	var local_t := t * (path.size() - 1) - idx
	var p1 := path[idx]
	var p2 := path[idx + 1]
	var point := p1.lerp(p2, local_t)

	# Perpendicular offset
	var dir := (p2 - p1).normalized()
	var perp := Vector3(-dir.z, 0, dir.x)
	return point + perp * lateral
