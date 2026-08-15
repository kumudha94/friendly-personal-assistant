import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "../../theme/tokens";

export type MiloCoreState = "idle" | "listening" | "thinking" | "success";

interface MiloCoreProps {
  state?: MiloCoreState;
  size?: number;
}

export default function MiloCore({ state = "idle", size = 64 }: MiloCoreProps) {
  const breathe = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const success = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    breathe.setValue(0);
    ring1.setValue(0);
    ring2.setValue(0);
    spin.setValue(0);
    success.setValue(0);

    let animation: Animated.CompositeAnimation | undefined;

    if (state === "idle") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      animation.start();
    } else if (state === "listening") {
      const makeRingLoop = (value: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(value, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        );
      animation = Animated.parallel([makeRingLoop(ring1, 0), makeRingLoop(ring2, 700)]);
      animation.start();
    } else if (state === "thinking") {
      animation = Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true }),
      );
      animation.start();
    } else if (state === "success") {
      animation = Animated.sequence([
        Animated.timing(success, { toValue: 1, duration: 220, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(success, { toValue: 0.85, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]);
      animation.start();
    }

    return () => animation?.stop();
  }, [state, breathe, ring1, ring2, spin, success]);

  const idleScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const idleOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const successScale = success.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {state === "listening" && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                opacity: ring1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                transform: [{ scale: ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                opacity: ring2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                transform: [{ scale: ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
              },
            ]}
          />
        </>
      )}

      {state === "thinking" && (
        <Animated.View
          style={[
            styles.thinkingRing,
            { width: size, height: size, borderRadius: size / 2, transform: [{ rotate: spinRotate }] },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [
              { scale: state === "idle" ? idleScale : state === "success" ? successScale : 1 },
            ],
            opacity: state === "idle" ? idleOpacity : 1,
          },
        ]}
      >
        <View style={[styles.orbInner, { width: size * 0.6, height: size * 0.6, borderRadius: (size * 0.6) / 2 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  orb: {
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  orbInner: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  thinkingRing: {
    position: "absolute",
    borderWidth: 2,
    borderTopColor: colors.accent,
    borderRightColor: "rgba(79,70,229,0.15)",
    borderBottomColor: "rgba(79,70,229,0.15)",
    borderLeftColor: "rgba(79,70,229,0.15)",
  },
});
