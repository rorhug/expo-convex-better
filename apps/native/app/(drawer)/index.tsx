import { api } from "@pdp/backend/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { Container } from "@/components/container";

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  const isConnected = healthCheck === "OK";
  const isLoading = healthCheck === undefined;

  return (
    <Container className="p-6">
      <View className="mb-6 py-4">
        <Text className="mb-2 font-bold text-4xl text-foreground">
          BETTER T STACK
        </Text>
      </View>
    </Container>
  );
}
