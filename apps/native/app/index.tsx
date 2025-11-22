import { View, ActivityIndicator } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Redirect } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function Index() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { data: orgs, isPending: isOrgsPending } = authClient.useListOrganizations();
  const themeColorForeground = useThemeColor("foreground");

  if (isSessionPending || isOrgsPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={themeColorForeground} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (!orgs || orgs.length === 0) {
    return <Redirect href="/no-org" />;
  }

  // Redirect to the first organization's dashboard (tabs)
  // Assuming route structure: /[orgId]/(drawer)/(tabs)/
  return <Redirect href={`/${orgs[0].id}/(drawer)/(tabs)`} />;
}

