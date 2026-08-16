import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useMutation } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { requestOtp, verifyOtp } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Otp">;

export default function OtpScreen({ route }: Props) {
  const { email } = route.params;
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const verify = useMutation({
    mutationFn: () => verifyOtp(email, code.trim()),
    onSuccess: (result) => login(result.token, result.user),
    onError: (err: Error) => setError(err.message),
  });

  const resend = useMutation({
    // Account already exists at this point (request-otp is idempotent for an existing
    // email) — the name value here is ignored server-side.
    mutationFn: () => requestOtp(email, "resend"),
    onSuccess: () => setResent(true),
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit() {
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    setError(null);
    verify.mutate();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code we sent to {email}</Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={6}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        autoFocus
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={verify.isPending}>
        <Text style={styles.buttonText}>{verify.isPending ? "Verifying…" : "Verify"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          setResent(false);
          resend.mutate();
        }}
        disabled={resend.isPending}
      >
        <Text style={styles.linkButtonText}>
          {resend.isPending ? "Sending…" : resent ? "Code sent again" : "Resend code"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: "center" },
  title: {
    fontSize: typography.screenTitle.fontSize,
    fontWeight: typography.screenTitle.fontWeight,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  error: { color: colors.error, fontSize: typography.caption.fontSize, textAlign: "center", marginBottom: spacing.sm },
  button: { backgroundColor: colors.accent, borderRadius: radius.control, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: colors.textPrimary, fontWeight: "700", fontSize: 15 },
  linkButton: { alignItems: "center", paddingVertical: spacing.md },
  linkButtonText: { color: colors.accent, fontSize: 14, fontWeight: "600" },
});
