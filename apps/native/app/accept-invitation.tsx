import { Ionicons } from "@expo/vector-icons";
import { api } from "@pdp/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, Tabs, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function AcceptInvitation() {
  const { invitationId } = useLocalSearchParams<{ invitationId: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const invitation = useQuery(
    api.organizations.getInvitation,
    invitationId ? { invitationId } : "skip"
  );
  const [status, setStatus] = useState<
    "checking" | "loading" | "success" | "error" | "auth"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("signin");

  const foregroundColor = useThemeColor("foreground");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  const acceptInvitation = useCallback(async () => {
    if (!invitationId) {
      return;
    }

    setStatus("loading");

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        setStatus("error");
        setErrorMessage(result.error.message || "Failed to accept invitation");
        return;
      }

      setStatus("success");
      // Redirect to the organization after a short delay
      setTimeout(() => {
        const orgId = result.data?.member.organizationId;
        if (orgId) {
          router.replace(`/${orgId}/(drawer)/(tabs)`);
        } else {
          router.replace("/");
        }
      }, 2000);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setStatus("error");
      setErrorMessage("An unexpected error occurred");
    }
  }, [invitationId, router]);

  useEffect(() => {
    if (!invitationId) {
      setStatus("error");
      setErrorMessage("No invitation ID provided");
      return;
    }

    // Wait for invitation and session check to complete
    if (invitation === undefined || isSessionPending) {
      return;
    }

    // Check if invitation exists
    if (!invitation) {
      setStatus("error");
      setErrorMessage("Invitation not found or has expired");
      return;
    }

    // If user is not logged in, show auth forms
    if (!session) {
      setStatus("auth");
      return;
    }

    // User is logged in, proceed with accepting invitation
    acceptInvitation();
  }, [invitationId, invitation, session, isSessionPending, acceptInvitation]);

  // Handle successful sign-in/sign-up
  useEffect(() => {
    if (session && status === "auth" && invitationId) {
      // User just logged in, accept the invitation
      acceptInvitation();
    }
  }, [session, status, invitationId, acceptInvitation]);

  if (status === "checking" || status === "loading") {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <ActivityIndicator color={foregroundColor} size="large" />
        <Text className="mt-4 text-foreground">
          {status === "checking" ? "Checking..." : "Accepting invitation..."}
        </Text>
      </Container>
    );
  }

  if (status === "auth") {
    return (
      <Container className="flex-1 p-6">
        <ScrollView className="flex-1 items-center">
          <View className="mb-6 w-full max-w-md space-y-4">
            <Card className="w-full p-6" variant="secondary">
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
                {invitation && (
                  <Text className="mt-2 text-center text-muted-foreground text-sm">
                    Invited as: {invitation.email}
                  </Text>
                )}
              </Card.Body>
            </Card>

            <Tabs
              className="w-full"
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
                    onSuccess={acceptInvitation}
                  />
                </Tabs.Content>
                <Tabs.Content value="signup">
                  <SignUp
                    emailDisabled={!!invitation?.email}
                    initialEmail={invitation?.email || ""}
                    onSuccess={acceptInvitation}
                  />
                </Tabs.Content>
              </View>
            </Tabs>
          </View>
        </ScrollView>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md p-6" variant="secondary">
          <Card.Body className="items-center gap-4">
            <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-danger/20">
              <Ionicons color={dangerColor} name="close-circle" size={48} />
            </View>
            <Card.Title className="text-center text-xl">Error</Card.Title>
            <Card.Description className="text-center">
              {errorMessage || "Failed to accept invitation"}
            </Card.Description>
          </Card.Body>
          <Card.Footer className="mt-4">
            <Pressable
              className="w-full rounded-lg bg-accent p-4 active:opacity-70"
              onPress={() => router.replace("/login")}
            >
              <Text className="text-center font-semibold text-accent-foreground">
                Go to Login
              </Text>
            </Pressable>
          </Card.Footer>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md p-6" variant="secondary">
        <Card.Body className="items-center gap-4">
          <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Ionicons color={successColor} name="checkmark-circle" size={48} />
          </View>
          <Card.Title className="text-center text-xl">
            Invitation Accepted!
          </Card.Title>
          <Card.Description className="text-center">
            You have successfully joined the organization. Redirecting...
          </Card.Description>
        </Card.Body>
      </Card>
    </Container>
  );
}
