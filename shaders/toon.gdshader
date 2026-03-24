// Toon/cel shader — gives objects a kid-friendly cartoon look.
shader_type spatial;

uniform vec4 base_color : source_color = vec4(0.3, 0.6, 1.0, 1.0);
uniform vec4 shade_color : source_color = vec4(0.15, 0.3, 0.5, 1.0);
uniform float shade_threshold : hint_range(0.0, 1.0) = 0.4;
uniform float shade_softness : hint_range(0.0, 0.5) = 0.05;
uniform float rim_amount : hint_range(0.0, 1.0) = 0.4;
uniform vec4 rim_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float emission_energy : hint_range(0.0, 3.0) = 0.0;

void fragment() {
	ALBEDO = base_color.rgb;
	EMISSION = base_color.rgb * emission_energy;
}

void light() {
	// Cel shading: hard step between lit and shaded
	float NdotL = dot(NORMAL, LIGHT);
	float shade = smoothstep(shade_threshold - shade_softness, shade_threshold + shade_softness, NdotL);
	vec3 lit_color = mix(shade_color.rgb, base_color.rgb, shade);

	// Rim lighting
	float rim = 1.0 - dot(NORMAL, VIEW);
	rim = smoothstep(1.0 - rim_amount, 1.0, rim);
	lit_color += rim_color.rgb * rim * 0.5;

	DIFFUSE_LIGHT += lit_color * LIGHT_COLOR * ATTENUATION;
}
