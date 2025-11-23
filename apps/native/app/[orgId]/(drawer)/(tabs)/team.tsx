import { Ionicons } from "@expo/vector-icons";
import { api } from "@pdp/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { setStringAsync } from "expo-clipboard";
import { useGlobalSearchParams } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
  Alert,
  // Clipboard,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Container } from "@/components/container";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { authClient } from "@/lib/auth-client";

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

type Invitation = {
  _id: string;
  organizationId: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: number;
  inviterId: string;
  createdAt: number;
};

export default function Team() {
  const { orgId } = useGlobalSearchParams<{ orgId: string }>();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(
    null
  );
  const members = useQuery(api.organizations.listMembers, {
    organizationId: orgId || "",
  });
  const invitations = useQuery(api.organizations.listInvitations, {
    organizationId: orgId || "",
  });

  const accentForegroundColor = useThemeColor("accent-foreground");
  const foregroundColor = useThemeColor("foreground");
  const dangerColor = useThemeColor("danger");
  const baseUrl = process.env.EXPO_PUBLIC_SITE_URL || "http://localhost:3000";

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
            <Text className="text-muted text-sm">{item.user.email}</Text>
          </View>
          <View className="px-2 py-1">
            <Text className="text-foreground text-lg capitalize">
              {item.role}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const handleCopyInvitation = async (invitationId: string) => {
    const url = `${baseUrl}/accept-invitation?invitationId=${invitationId}`;
    await setStringAsync(url);
    setCopiedInvitationId(invitationId);
    setTimeout(() => setCopiedInvitationId(null), 2000);
  };

  const handleDeleteInvitation = (invitationId: string, email: string) => {
    Alert.alert(
      "Cancel Invitation",
      `Are you sure you want to cancel the invitation for ${email}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await authClient.organization.cancelInvitation({
                invitationId,
              });
              if (result.error) {
                Alert.alert(
                  "Error",
                  result.error.message || "Failed to cancel invitation"
                );
              }
            } catch (error) {
              console.error("Error canceling invitation:", error);
              Alert.alert("Error", "Failed to cancel invitation");
            }
          },
        },
      ]
    );
  };

  const renderInvitationItem = ({ item }: { item: Invitation }) => {
    const isExpired = Date.now() > item.expiresAt;
    const isCopied = copiedInvitationId === item._id;

    return (
      <Card className="mb-2 p-4" variant="secondary">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-medium text-foreground">{item.email}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="text-muted text-xs capitalize">
                {item.role || "member"}
              </Text>
              {isExpired && (
                <View className="rounded bg-danger/20 px-2 py-0.5">
                  <Text className="text-danger text-xs">Expired</Text>
                </View>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="rounded px-2 py-1">
              <Text className="text-foreground text-xs capitalize">
                {item.status}
              </Text>
            </View>
            <Pressable
              className="rounded-lg bg-accent/10 p-2 active:opacity-70"
              onPress={() => handleCopyInvitation(item._id)}
            >
              {isCopied ? (
                <Ionicons
                  color={accentForegroundColor}
                  name="checkmark"
                  size={18}
                />
              ) : (
                <Ionicons
                  color={foregroundColor}
                  name="copy-outline"
                  size={18}
                />
              )}
            </Pressable>
            <Pressable
              className="rounded-lg bg-danger/10 p-2 active:opacity-70"
              onPress={() => handleDeleteInvitation(item._id, item.email)}
            >
              <Ionicons color={dangerColor} name="trash-outline" size={18} />
            </Pressable>
          </View>
        </View>
      </Card>
    );
  };

  const isLoading = members === undefined || invitations === undefined;

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text className="mb-4 font-bold text-2xl text-foreground">
          Team Members
        </Text>
        <Text className="text-foreground">Loading...</Text>
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-bold text-2xl text-foreground">Team Members</Text>
        <Pressable
          className="flex-row items-center gap-2 rounded-lg bg-accent px-4 py-2 active:opacity-70"
          onPress={() => setShowInviteDialog(true)}
        >
          <Ionicons
            color={accentForegroundColor}
            name="person-add-outline"
            size={20}
          />
          <Text className="font-semibold text-accent-foreground">Invite</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {invitations && invitations.length > 0 && (
          <View className="mb-6">
            <Text className="mb-2 font-semibold text-foreground text-lg">
              Pending Invitations
            </Text>
            <FlatList
              data={invitations}
              keyExtractor={(item) => item._id}
              renderItem={renderInvitationItem}
              scrollEnabled={false}
            />
          </View>
        )}

        <View>
          <Text className="mb-2 font-semibold text-foreground text-lg">
            Members
          </Text>
          {members && members.length > 0 ? (
            <FlatList
              data={members}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <Text className="text-muted-foreground">No members found.</Text>
              }
              renderItem={renderItem}
              scrollEnabled={false}
            />
          ) : (
            <Text className="text-muted-foreground">
              No members found. Invite someone to get started!
            </Text>
          )}
        </View>
      </ScrollView>

      <InviteMemberDialog
        onClose={() => setShowInviteDialog(false)}
        organizationId={orgId || ""}
        visible={showInviteDialog}
      />
    </Container>
  );
}
