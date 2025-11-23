import { useRouter } from "expo-router";
import { Button, TextField } from "heroui-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { authClient } from "@/lib/auth-client";

type SignInProps = {
  initialEmail?: string;
  emailDisabled?: boolean;
  invitationId?: string;
  onSuccess?: () => void;
};

export function SignIn({
  initialEmail = "",
  emailDisabled = false,
  invitationId,
  onSuccess,
}: SignInProps = {}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update email when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (_error) => {
          setError(_error.error?.message || "Failed to sign in");
          setIsLoading(false);
        },
        onSuccess: () => {
          setPassword("");
          setIsLoading(false);
          if (invitationId) {
            router.replace(`/accept-invitation?invitationId=${invitationId}`);
          } else {
            onSuccess?.();
          }
        },
        onFinished: () => {
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <View className="gap-4">
      <TextField isDisabled={emailDisabled} isInvalid={!!error} isRequired>
        <TextField.Label>Email</TextField.Label>
        <TextField.Input
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text) => {
            setEmail(text);
            if (error) {
              setError(null);
            }
          }}
          placeholder="Enter your email"
          value={email}
        />
        {error && <TextField.ErrorMessage>{error}</TextField.ErrorMessage>}
      </TextField>

      <TextField isInvalid={!!error} isRequired>
        <TextField.Label>Password</TextField.Label>
        <TextField.Input
          onChangeText={(text) => {
            setPassword(text);
            if (error) {
              setError(null);
            }
          }}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
        />
      </TextField>

      <Button
        className="mt-2"
        isDisabled={isLoading}
        onPress={handleLogin}
        size="lg"
        variant="secondary"
      >
        <Button.Label>Sign In</Button.Label>
      </Button>
    </View>
  );
}
