// Procedural gradient sky shader.
shader_type sky;

uniform vec4 top_color : source_color = vec4(0.2, 0.4, 0.9, 1.0);
uniform vec4 bottom_color : source_color = vec4(0.7, 0.85, 1.0, 1.0);
uniform vec4 horizon_color : source_color = vec4(0.9, 0.8, 0.6, 1.0);
uniform float horizon_blend : hint_range(0.0, 1.0) = 0.15;

void sky() {
	float y = EYEDIR.y;

	// Below horizon
	if (y < 0.0) {
		COLOR = bottom_color.rgb;
	} else {
		// Blend horizon to top
		float t = smoothstep(0.0, horizon_blend, y);
		vec3 lower = mix(horizon_color.rgb, bottom_color.rgb, 0.5);
		COLOR = mix(lower, top_color.rgb, t);
	}
}
