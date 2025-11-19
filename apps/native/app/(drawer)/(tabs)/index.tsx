import { Card } from "heroui-native";
import { View } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";

export default function Home() {
  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center">
        <SignIn />
        <SignUp />
        <Card className="items-center p-8" variant="secondary">
          <Card.Title className="mb-2 text-3xl">Tab One</Card.Title>
        </Card>
      </View>
    </Container>
  );
}
