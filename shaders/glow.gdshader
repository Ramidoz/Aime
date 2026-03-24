// Pulsing glow shader for collectibles and the goal portal.
shader_type spatial;

uniform vec4 glow_color : source_color = vec4(1.0, 0.8, 0.0, 1.0);
uniform float glow_intensity : hint_range(0.0, 5.0) = 1.5;
uniform float pulse_speed : hint_range(0.0, 10.0) = 2.0;
uniform float pulse_amount : hint_range(0.0, 1.0) = 0.3;

void fragment() {
	float pulse = 1.0 + sin(TIME * pulse_speed) * pulse_amount;
	ALBEDO = glow_color.rgb;
	EMISSION = glow_color.rgb * glow_intensity * pulse;
	ALPHA = 0.85;
}
