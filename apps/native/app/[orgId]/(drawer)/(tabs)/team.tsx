import { api } from "@pdp/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { Card } from "heroui-native";
import { FlatList, Text, View } from "react-native";
import { Container } from "@/components/container";

type MemberWithUser = {
  _id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: number;
  user: {
    _id: string;
    // userId: string | null;
    name: string;
    email: string;
    // emailVerified: boolean;
    // image: string | null;
    // createdAt: number;
    // updatedAt: number;
    // twoFactorEnabled: boolean | null;
  } | null;
};

export default function Team() {
  const { orgId } = useGlobalSearchParams<{ orgId: string }>();
  const members = useQuery(api.organizations.listMembers, {
    organizationId: orgId || "",
  });

  console.log("members", members);

  const renderItem = ({ item }: { item: MemberWithUser }) => {
    if (!item.user) {
      return null;
    }

    return (
      <Card className="mb-2 p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-medium text-foreground">
              {item.user.name}
            </Text>
            <Text className="text-muted-foreground text-sm">
              {item.user.email}
            </Text>
          </View>
          <View className="rounded bg-muted px-2 py-1">
            <Text className="text-foreground text-xs capitalize">
              {item.role}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (members === undefined) {
    return (
      <Container className="p-6">
        <Text className="mb-4 font-bold text-2xl text-foreground">
          Team Members
        </Text>
        <Text className="text-foreground">Loading...</Text>
      </Container>
    );
  }

  if (members.length === 0) {
    return (
      <Container className="p-6">
        <Text className="mb-4 font-bold text-2xl text-foreground">
          Team Members
        </Text>
        <Text className="text-muted-foreground">
          No members found. OrgID: {orgId}
        </Text>
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <Text className="mb-4 font-bold text-2xl text-foreground">
        Team Members
      </Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text className="text-muted-foreground">
            No members found. OrgID: {orgId}
          </Text>
        }
        renderItem={renderItem}
      />
    </Container>
  );
}
