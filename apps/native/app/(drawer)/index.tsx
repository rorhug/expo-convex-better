import { api } from "@pdp/backend/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { Container } from "@/components/container";

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);
  const { isAuthenticated } = useConvexAuth();
  const _user = useQuery(
    api.auth.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const _mutedColor = useThemeColor("muted");
  const _successColor = useThemeColor("success");
  const _dangerColor = useThemeColor("danger");

  const _isConnected = healthCheck === "OK";
  const _isLoading = healthCheck === undefined;

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
