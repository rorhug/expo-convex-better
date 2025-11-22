import { View, Text } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";
import { Redirect } from "expo-router";

export default function LoginScreen() {
  const { data: session } = authClient.useSession();

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-2xl font-bold text-foreground">Welcome</Text>
        <SignIn />
        <View className="h-4" />
        <SignUp />
      </View>
    </Container>
  );
}

