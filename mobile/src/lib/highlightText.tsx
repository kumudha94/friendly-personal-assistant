import { Fragment } from "react";
import { Text, type TextStyle } from "react-native";
import { colors } from "../theme/tokens";

// Matches numbers (incl. °C/decimals) and clock times — the tokens worth calling out in an
// otherwise muted sentence, e.g. "12°C and light rain today" or "Call mom at 18:00."
const HIGHLIGHT_PATTERN = /(\d{1,2}:\d{2}|\d+(?:\.\d+)?°?C?)/g;

// Splits body copy into plain/highlighted <Text> spans so callers can render a single sentence
// with its numbers picked out in the warm accent color, matching the reference dashboard's
// inline keyword-highlight style.
export function renderHighlighted(text: string, highlightStyle?: TextStyle) {
  const parts = text.split(HIGHLIGHT_PATTERN);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={[{ color: colors.highlight, fontWeight: "600" as const }, highlightStyle]}>
        {part}
      </Text>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
