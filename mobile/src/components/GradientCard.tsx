import type { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients, radius } from "../theme/tokens";

interface GradientCardProps {
  children: ReactNode;
  onPress?: () => void;
  colors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
}

// Soft two-tone card surface used across the Dashboard (Money/Home/Personal cards, weather
// chip, quick actions) instead of the flat colors.surface + border treatment.
export default function GradientCard({ children, onPress, colors = gradients.card, style }: GradientCardProps) {
  const content = (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radius.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
});
