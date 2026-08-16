import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { requestOtp } from "../../lib/api";
import MiloCore from "../../components/milo/MiloCore";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "EmailEntry">;

export default function EmailEntryScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendOtp = useMutation({
    mutationFn: () => requestOtp(email.trim(), name.trim()),
    onSuccess: () => navigation.navigate("Otp", { email: email.trim() }),
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit() {
    if (!name.trim()) {
      setError("Enter a name Milo can call you.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email address to continue.");
      return;
    }
    setError(null);
    sendOtp.mutate();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : StatusBar.currentHeight ?? 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <MiloCore state="idle" size={56} />
          <Text style={styles.title}>I'm Milo.</Text>
          <Text style={styles.subtitle}>Enter your email — I'll send you a code to sign in.</Text>
        </View>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          onSubmitEditing={handleSubmit}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={sendOtp.isPending}>
          <Text style={styles.buttonText}>{sendOtp.isPending ? "Sending…" : "Send code"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  hero: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  title: { fontSize: typography.hero.fontSize, fontWeight: typography.hero.fontWeight, color: colors.textPrimary },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  error: { color: colors.error, fontSize: typography.caption.fontSize, marginBottom: spacing.sm },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: colors.textPrimary, fontWeight: "700", fontSize: 15 },
});
