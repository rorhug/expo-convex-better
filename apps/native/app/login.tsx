import { Redirect } from "expo-router";
import { Tabs } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("signin");

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-bold text-2xl text-foreground">Welcome</Text>
        <Tabs
          className="w-full max-w-md"
          onValueChange={setActiveTab}
          value={activeTab}
          variant="pill"
        >
          <Tabs.List className="border-b-0">
            <Tabs.ScrollView contentContainerClassName="gap-4">
              <Tabs.Indicator />
              <Tabs.Trigger value="signin">
                <Tabs.Label>Sign In</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="signup">
                <Tabs.Label>Sign Up</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.ScrollView>
          </Tabs.List>
          <View className="px-2 py-6">
            <Tabs.Content value="signin">
              <SignIn />
            </Tabs.Content>
            <Tabs.Content value="signup">
              <SignUp />
            </Tabs.Content>
          </View>
        </Tabs>
      </View>
    </Container>
  );
}
