## AudioManager — Handles SFX and music with pooled players.
extends Node

const SFX_POOL_SIZE := 8

var _sfx_pool: Array[AudioStreamPlayer] = []
var _music_player: AudioStreamPlayer
var _current_music: String = ""


func _ready() -> void:
	# Create music player
	_music_player = AudioStreamPlayer.new()
	_music_player.bus = &"Master"
	add_child(_music_player)

	# Create SFX pool
	for i in range(SFX_POOL_SIZE):
		var player := AudioStreamPlayer.new()
		player.bus = &"Master"
		add_child(player)
		_sfx_pool.append(player)


func play_sfx(stream: AudioStream, pitch: float = 1.0, volume_db: float = 0.0) -> void:
	if stream == null:
		return
	for player in _sfx_pool:
		if not player.playing:
			player.stream = stream
			player.pitch_scale = pitch
			player.volume_db = volume_db
			player.play()
			return
	# All busy — reuse first
	_sfx_pool[0].stream = stream
	_sfx_pool[0].pitch_scale = pitch
	_sfx_pool[0].volume_db = volume_db
	_sfx_pool[0].play()


func play_collect(combo: int) -> void:
	# Pitch increases with combo (generate procedural beep)
	var pitch := 1.0 + minf(combo * 0.04, 0.4)
	_play_procedural_tone(880.0 * pitch, 0.08, pitch)


func play_boost() -> void:
	_play_procedural_tone(400.0, 0.2, 1.0)


func play_hit() -> void:
	_play_procedural_tone(120.0, 0.15, 0.8)


func play_victory() -> void:
	# Ascending notes
	for i in range(4):
		var freq := [523.0, 659.0, 784.0, 1047.0][i]
		get_tree().create_timer(i * 0.12).timeout.connect(
			func(): _play_procedural_tone(freq, 0.3, 1.0)
		)


func play_defeat() -> void:
	_play_procedural_tone(200.0, 0.4, 0.7)


func play_click() -> void:
	_play_procedural_tone(600.0, 0.05, 0.5)


func play_music(track_name: String) -> void:
	# Placeholder — load from res://assets/audio/music/{track_name}.ogg
	_current_music = track_name


func stop_music() -> void:
	_music_player.stop()
	_current_music = ""


func _play_procedural_tone(frequency: float, duration: float, volume: float) -> void:
	# Generate a simple sine wave tone procedurally
	var sample_rate := 22050
	var num_samples := int(duration * sample_rate)
	var audio := AudioStreamWAV.new()
	audio.format = AudioStreamWAV.FORMAT_16_BITS
	audio.mix_rate = sample_rate
	audio.stereo = false

	var data := PackedByteArray()
	data.resize(num_samples * 2)

	for i in range(num_samples):
		var t := float(i) / sample_rate
		var envelope := clampf(1.0 - t / duration, 0.0, 1.0)
		var sample := sin(t * frequency * TAU) * envelope * volume
		var sample_int := clampi(int(sample * 32767.0), -32768, 32767)
		data[i * 2] = sample_int & 0xFF
		data[i * 2 + 1] = (sample_int >> 8) & 0xFF

	audio.data = data
	play_sfx(audio)
