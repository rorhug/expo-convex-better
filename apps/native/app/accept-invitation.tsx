import { Ionicons } from "@expo/vector-icons";
import { api } from "@pdp/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function AcceptInvitation() {
  const { invitationId } = useLocalSearchParams<{ invitationId: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  // Track if acceptance is in progress or completed to prevent duplicate calls
  const isAcceptingRef = useRef(false);
  const hasAcceptedRef = useRef(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Stop querying invitation after successful acceptance to prevent "not found" errors
  const invitation = useQuery(
    api.organizations.getInvitation,
    invitationId && !hasAccepted ? { invitationId } : "skip"
  );
  const [status, setStatus] = useState<
    "ready" | "loading" | "success" | "error"
  >("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const foregroundColor = useThemeColor("foreground");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!(isSessionPending || session) && invitationId) {
      router.replace(`/login?invitationId=${invitationId}`);
    }
  }, [session, isSessionPending, invitationId, router]);

  const acceptInvitation = useCallback(async () => {
    // Prevent duplicate calls
    if (!invitationId || isAcceptingRef.current || hasAcceptedRef.current) {
      return;
    }

    isAcceptingRef.current = true;
    setStatus("loading");

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        console.error("Error accepting invitation:", result.error);
        const errorMsg =
          result.error.message ||
          result.error.code ||
          "Failed to accept invitation";
        setStatus("error");
        setErrorMessage(errorMsg);
        isAcceptingRef.current = false;
        return;
      }

      if (!result.data) {
        console.error("No data in result:", result);
        setStatus("error");
        setErrorMessage("Failed to accept invitation: No data returned");
        isAcceptingRef.current = false;
        return;
      }

      // Mark as accepted to prevent further calls
      hasAcceptedRef.current = true;
      setHasAccepted(true);
      setStatus("success");

      const orgId = result.data?.member.organizationId;
      // Redirect to the organization after a short delay
      setTimeout(() => {
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
      isAcceptingRef.current = false;
    }
  }, [invitationId, router]);

  // Validate invitation
  useEffect(() => {
    if (
      hasAccepted ||
      status === "success" ||
      status === "loading" ||
      !invitationId
    ) {
      return;
    }

    if (invitation === undefined || isSessionPending) {
      return;
    }

    if (!invitation) {
      setStatus("error");
      setErrorMessage("Invitation not found or has expired");
      return;
    }
  }, [invitationId, invitation, isSessionPending, status, hasAccepted]);

  // Show loading while checking session or invitation
  if (isSessionPending || invitation === undefined) {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <ActivityIndicator color={foregroundColor} size="large" />
        <Text className="mt-4 text-foreground">Loading...</Text>
      </Container>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but show loading during redirect)
  if (!session && invitationId) {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <ActivityIndicator color={foregroundColor} size="large" />
        <Text className="mt-4 text-foreground">Redirecting to login...</Text>
      </Container>
    );
  }

  if (status === "loading") {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <ActivityIndicator color={foregroundColor} size="large" />
        <Text className="mt-4 text-foreground">Accepting invitation...</Text>
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

  if (status === "success") {
    return (
      <Container className="flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md p-6" variant="secondary">
          <Card.Body className="items-center gap-4">
            <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <Ionicons
                color={successColor}
                name="checkmark-circle"
                size={48}
              />
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

  // Show Accept button when ready
  return (
    <Container className="flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md p-6" variant="secondary">
        <Card.Body className="items-center gap-4">
          <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <Ionicons color={foregroundColor} name="mail-outline" size={48} />
          </View>
          <Card.Title className="text-center text-xl">
            Accept Invitation
          </Card.Title>
          <Card.Description className="text-center">
            {invitation && (
              <>
                You've been invited to join an organization.
                <Text className="mt-2 block text-muted-foreground">
                  Invited as: {invitation.email}
                </Text>
              </>
            )}
          </Card.Description>
        </Card.Body>
        <Card.Footer className="mt-4">
          <Button
            className="w-full"
            onPress={acceptInvitation}
            size="lg"
            variant="secondary"
          >
            <Button.Label>Accept Invitation</Button.Label>
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
