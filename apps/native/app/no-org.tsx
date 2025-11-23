import { Redirect, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function NoOrgScreen() {
  const router = useRouter();
  // const { data: session } = authClient.useSession();
  const { data: orgs, isPending: isOrgsPending } =
    authClient.useListOrganizations();

  const [isCreating, setIsCreating] = useState(false);
  const foregroundColor = useThemeColor("foreground");

  // If user gets added to an org, redirect
  if (orgs && orgs.length > 0) {
    return <Redirect href="/" />; // Index will handle redirect to specific org
  }

  const createOrg = async () => {
    setIsCreating(true);
    try {
      await authClient.organization.create(
        {
          name: "My Organization",
          slug: `my-org-${Math.random().toString(36).substring(7)}`,
        },
        {
          onSuccess: () => {
            router.replace("/");
          },
          onError: (ctx) => {
            console.error("Failed to create org", ctx);
            setIsCreating(false);
          },
        }
      );
    } catch (e) {
      console.error(e);
      setIsCreating(false);
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  if (isOrgsPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={foregroundColor} size="large" />
      </View>
    );
  }

  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-center font-bold text-foreground text-xl">
          You are not part of any organization.
        </Text>
        <Text className="mb-4 text-center text-muted-foreground">
          Ask an admin to invite you, or create a new one.
        </Text>

        <Pressable
          className="flex-row items-center rounded-lg bg-accent px-6 py-3"
          disabled={isCreating}
          onPress={createOrg}
        >
          {isCreating ? (
            <ActivityIndicator
              className="mr-2"
              color={foregroundColor}
              size="small"
            />
          ) : null}

          <Text className="font-semibold text-foreground">
            Create Organization
          </Text>
        </Pressable>

        <Pressable
          className="rounded-lg border border-divider px-6 py-3"
          onPress={signOut}
        >
          <Text className="text-foreground">Sign Out</Text>
        </Pressable>
      </View>
    </Container>
  );
}
