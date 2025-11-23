import { Ionicons } from "@expo/vector-icons";
import { api } from "@pdp/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Card, Tabs, useThemeColor } from "heroui-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
  const { invitationId } = useLocalSearchParams<{ invitationId?: string }>();
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("signin");
  const foregroundColor = useThemeColor("foreground");

  const invitation = useQuery(
    api.organizations.getInvitation,
    invitationId ? { invitationId } : "skip"
  );

  // If user is logged in and has invitationId, redirect to accept-invitation
  if (session && invitationId) {
    return (
      <Redirect href={`/accept-invitation?invitationId=${invitationId}`} />
    );
  }

  // If user is logged in without invitation, redirect home
  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <Container className="p-6">
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center gap-4 py-6">
          {invitationId && invitation && (
            <Card className="mb-4 w-full max-w-md p-6" variant="secondary">
              <Card.Body className="items-center gap-2">
                <Ionicons
                  color={foregroundColor}
                  name="mail-outline"
                  size={48}
                />
                <Card.Title className="text-center text-xl">
                  Accept Invitation
                </Card.Title>
                <Card.Description className="text-center">
                  Sign in or create an account to accept the invitation to join
                  this organization.
                </Card.Description>
                <Text className="mt-2 text-center text-muted-foreground text-sm">
                  Invited as: {invitation.email}
                </Text>
              </Card.Body>
            </Card>
          )}
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
                <SignIn
                  emailDisabled={!!invitation?.email}
                  initialEmail={invitation?.email || ""}
                  invitationId={invitationId}
                />
              </Tabs.Content>
              <Tabs.Content value="signup">
                <SignUp
                  emailDisabled={!!invitation?.email}
                  initialEmail={invitation?.email || ""}
                  invitationId={invitationId}
                />
              </Tabs.Content>
            </View>
          </Tabs>
        </View>
      </ScrollView>
    </Container>
  );
}
