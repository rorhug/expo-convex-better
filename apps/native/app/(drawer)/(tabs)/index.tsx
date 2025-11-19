import { Card } from "heroui-native";
import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center">
        {isPending ? <Text className="text-foreground">Loading...</Text> : null}
        {session ? (
          <Text className="text-foreground">Signed in</Text>
        ) : (
          <Text className="text-foreground">Signed out</Text>
        )}
        <SignIn />
        <SignUp />
        <Card className="items-center p-8" variant="secondary">
          <Card.Title className="mb-2 text-3xl">Tab One</Card.Title>
        </Card>
      </View>
    </Container>
  );
}
