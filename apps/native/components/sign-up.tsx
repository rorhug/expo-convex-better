import { useRouter } from "expo-router";
import { Button, TextField } from "heroui-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { authClient } from "@/lib/auth-client";

type SignUpProps = {
  initialEmail?: string;
  emailDisabled?: boolean;
  invitationId?: string;
  onSuccess?: () => void;
};

export function SignUp({
  initialEmail = "",
  emailDisabled = false,
  invitationId,
  onSuccess,
}: SignUpProps = {}) {
  const router = useRouter();
  const [name, setName] = useState("");
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

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onError: (_error) => {
          setError(_error.error?.message || "Failed to sign up");
          setIsLoading(false);
        },
        onSuccess: () => {
          setName("");
          setPassword("");
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
      <TextField isInvalid={!!error && !name.trim()} isRequired>
        <TextField.Label>Name</TextField.Label>
        <TextField.Input
          onChangeText={(text) => {
            setName(text);
            if (error) {
              setError(null);
            }
          }}
          placeholder="Enter your full name"
          value={name}
        />
        {error && !name.trim() && (
          <TextField.ErrorMessage>{error}</TextField.ErrorMessage>
        )}
      </TextField>

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

      <TextField isInvalid={!!error && !password.trim()} isRequired>
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
        {error && !password.trim() && (
          <TextField.ErrorMessage>{error}</TextField.ErrorMessage>
        )}
      </TextField>

      <Button
        className="mt-2"
        isDisabled={isLoading}
        onPress={handleSignUp}
        size="lg"
        variant="secondary"
      >
        <Button.Label>Sign Up</Button.Label>
      </Button>
    </View>
  );
}
