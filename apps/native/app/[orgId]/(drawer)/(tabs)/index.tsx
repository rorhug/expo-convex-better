import { useGlobalSearchParams } from "expo-router";
import { Card } from "heroui-native";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { orgId } = useGlobalSearchParams<{ orgId: string }>();
  const { data: orgs } = authClient.useListOrganizations();

  const org = useMemo(() => orgs?.find((o) => o.id === orgId), [orgs, orgId]);

  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center">
        <Card className="items-center p-8" variant="secondary">
          <Card.Title className="mb-2 text-3xl">Welcome</Card.Title>
          <Text className="text-center text-foreground text-lg">
            {org ? `You are in ${org.name}` : "Loading organization..."}
          </Text>
          <Text className="mt-2 text-muted-foreground">Org ID: {orgId}</Text>
        </Card>
      </View>
    </Container>
  );
}
