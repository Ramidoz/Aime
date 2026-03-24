export function buildSafetyFilterPrompt(blocksJson: string): string {
  return `You are a child safety expert. Your job is to review game building blocks designed for children aged 6-12.

Review the following blocks and ensure they are:
1. Completely kid-safe (no violence, fear, adult themes)
2. Written in simple language a 6-year-old can understand
3. Positive and encouraging
4. Free of any harmful, scary, or inappropriate content

INPUT BLOCKS:
${blocksJson}

If ALL blocks pass safety review, return the EXACT same JSON unchanged.
If any block fails, replace it with a safe alternative that fits the same theme.

IMPORTANT: Output ONLY valid JSON in the exact same format as the input. No markdown, no explanations.`;
}
