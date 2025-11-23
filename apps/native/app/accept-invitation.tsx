import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function AcceptInvitation() {
  const { invitationId } = useLocalSearchParams<{ invitationId: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [status, setStatus] = useState<
    "checking" | "loading" | "success" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const foregroundColor = useThemeColor("foreground");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  useEffect(() => {
    if (!invitationId) {
      setStatus("error");
      setErrorMessage("No invitation ID provided");
      return;
    }

    // Wait for session check to complete
    if (isSessionPending) {
      return;
    }

    // If user is not logged in, redirect to login with return URL
    if (!session) {
      router.replace(
        `/login?redirect=/accept-invitation?invitationId=${invitationId}`
      );
      return;
    }

    // User is logged in, proceed with accepting invitation
    setStatus("loading");

    const acceptInvitation = async () => {
      try {
        const result = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (result.error) {
          setStatus("error");
          setErrorMessage(
            result.error.message || "Failed to accept invitation"
          );
          return;
        }

        setStatus("success");
        // Redirect to the organization after a short delay
        setTimeout(() => {
          const orgId = result.data?.organizationId;
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
    };

    acceptInvitation();
  }, [invitationId, router, session, isSessionPending]);

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
