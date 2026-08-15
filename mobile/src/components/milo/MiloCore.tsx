import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "../../theme/tokens";

export type MiloCoreState = "idle" | "listening" | "thinking" | "speaking" | "executing" | "success";

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
  // Generic 0-1 expression value, re-driven differently per state (see below) — drives the
  // face (eyes/mouth), never the orb's own glow/ring animations above.
  const facePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    breathe.setValue(0);
    ring1.setValue(0);
    ring2.setValue(0);
    spin.setValue(0);
    success.setValue(0);
    facePulse.setValue(0);

    const animations: Animated.CompositeAnimation[] = [];

    if (state === "idle") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(breathe, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(breathe, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ),
      );
    } else if (state === "listening") {
      const makeRingLoop = (value: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(value, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        );
      animations.push(makeRingLoop(ring1, 0), makeRingLoop(ring2, 700));
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(facePulse, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(facePulse, { toValue: 0, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ),
      );
    } else if (state === "thinking") {
      animations.push(
        Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })),
      );
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(facePulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(facePulse, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ),
      );
    } else if (state === "speaking") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(facePulse, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(facePulse, { toValue: 0.3, duration: 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
            Animated.timing(facePulse, { toValue: 0.9, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(facePulse, { toValue: 0, duration: 200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          ]),
        ),
      );
    } else if (state === "executing") {
      animations.push(
        Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: true })),
      );
      animations.push(
        Animated.timing(facePulse, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      );
    } else if (state === "success") {
      animations.push(
        Animated.sequence([
          Animated.timing(success, { toValue: 1, duration: 220, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
          Animated.timing(success, { toValue: 0.85, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      animations.push(
        Animated.sequence([
          Animated.timing(facePulse, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(facePulse, { toValue: 0.7, duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
    }

    const composite = Animated.parallel(animations);
    composite.start();
    return () => composite.stop();
  }, [state, breathe, ring1, ring2, spin, success, facePulse]);

  const idleScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const idleOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const successScale = success.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  // Face expression, per state — all transform-based (scale/translate) so they stay
  // native-driver compatible, same as the orb-level animations above.
  const eyeScale =
    state === "listening" ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) : 1;
  const eyeTranslateX =
    state === "thinking" ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.035, size * 0.035] }) : 0;
  const eyeTranslateY =
    state === "executing" ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.05] }) : 0;
  const eyeSquint =
    state === "success" ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }) : 1;

  const mouthScaleX =
    state === "listening"
      ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] })
      : state === "success"
        ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] })
        : 1;
  const mouthScaleY =
    state === "listening"
      ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] })
      : state === "speaking"
        ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] })
        : state === "thinking"
          ? 0.55
          : 1;

  const orbSpeakingPulse =
    state === "speaking" ? facePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) : 1;

  const eyeSize = { width: size * 0.11, height: size * 0.2 };
  const dotSize = size * 0.08;

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

      {state === "executing" && (
        <Animated.View
          style={[styles.orbitLayer, { width: size, height: size, transform: [{ rotate: spinRotate }] }]}
        >
          <View style={[styles.orbitDot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, top: -dotSize / 2, left: size / 2 - dotSize / 2 }]} />
          <View style={[styles.orbitDot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, bottom: -dotSize / 2, left: size / 2 - dotSize / 2 }]} />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [
              {
                scale:
                  state === "idle"
                    ? idleScale
                    : state === "success"
                      ? successScale
                      : state === "speaking"
                        ? orbSpeakingPulse
                        : 1,
              },
            ],
            opacity: state === "idle" ? idleOpacity : 1,
          },
        ]}
      >
        <View style={styles.face}>
          <Animated.View
            style={[
              styles.eye,
              eyeSize,
              {
                borderRadius: eyeSize.width / 2,
                transform: [{ translateX: eyeTranslateX }, { translateY: eyeTranslateY }, { scale: eyeScale }, { scaleY: eyeSquint }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.eye,
              eyeSize,
              {
                borderRadius: eyeSize.width / 2,
                marginLeft: size * 0.13,
                transform: [{ translateX: eyeTranslateX }, { translateY: eyeTranslateY }, { scale: eyeScale }, { scaleY: eyeSquint }],
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.mouth,
            {
              width: size * 0.3,
              height: size * 0.15,
              borderBottomLeftRadius: size * 0.15,
              borderBottomRightRadius: size * 0.15,
              borderBottomWidth: Math.max(1.5, size * 0.045),
              marginTop: size * 0.08,
              transform: [{ scaleX: mouthScaleX }, { scaleY: mouthScaleY }],
            },
          ]}
        />
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
  face: { flexDirection: "row" },
  eye: { backgroundColor: colors.background },
  mouth: {
    borderColor: colors.background,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "transparent",
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
  orbitLayer: { position: "absolute" },
  orbitDot: { position: "absolute", backgroundColor: colors.accent },
});
