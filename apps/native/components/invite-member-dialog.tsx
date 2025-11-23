import { Ionicons } from "@expo/vector-icons";
import { Card, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { authClient } from "@/lib/auth-client";

type InviteMemberDialogProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
};

export function InviteMemberDialog({
  visible,
  onClose,
  organizationId,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const accentForegroundColor = useThemeColor("accent-foreground");
  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const handleInvite = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    setIsInviting(true);
    try {
      const result = await authClient.organization.inviteMember({
        email: trimmedEmail,
        organizationId,
        role,
      });

      if (result.error) {
        Alert.alert(
          "Error",
          result.error.message || "Failed to send invitation"
        );
        setIsInviting(false);
        return;
      }

      // Generate invitation URL
      // Better Auth returns the invitation with an ID
      // The invitation is accepted on the client side using acceptInvitation method
      // We'll create a URL that points to our accept-invitation page
      const invitationId = result.data?.id;
      if (invitationId) {
        // Construct the invitation acceptance URL
        // This URL points to a client-side page that will call authClient.organization.acceptInvitation()
        // Users can sign up/in first, then visit this URL to accept the invitation
        const url = `${baseUrl}/accept-invitation?invitationId=${invitationId}`;
        setInvitationUrl(url);
      } else {
        // If no ID in response, log it for debugging
        console.log("Invitation response:", result.data);
        Alert.alert(
          "Invitation Sent",
          "The invitation has been sent, but the invitation link could not be generated. Please check the console for details."
        );
        setIsInviting(false);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      Alert.alert("Error", "Failed to send invitation");
      setIsInviting(false);
    }
  };

  const handleCopy = () => {
    if (invitationUrl) {
      Clipboard.setString(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    setInvitationUrl(null);
    setCopied(false);
    setIsInviting(false);
    onClose();
  };

  const renderInvitationForm = () => (
    <>
      <View>
        <Text className="mb-2 font-medium text-foreground text-sm">
          Email Address
        </Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          className="rounded-lg border border-divider bg-background px-4 py-3 text-foreground"
          editable={!isInviting}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor={mutedColor}
          value={email}
        />
      </View>

      <View>
        <Text className="mb-2 font-medium text-foreground text-sm">Role</Text>
        <View className="flex-row gap-2">
          <Pressable
            className={`flex-1 rounded-lg border px-4 py-3 ${
              role === "member"
                ? "border-accent bg-accent"
                : "border-divider bg-background"
            }`}
            disabled={isInviting}
            onPress={() => setRole("member")}
          >
            <Text
              className={`text-center font-medium ${
                role === "member" ? "text-accent-foreground" : "text-foreground"
              }`}
            >
              Member
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 rounded-lg border px-4 py-3 ${
              role === "admin"
                ? "border-accent bg-accent"
                : "border-divider bg-background"
            }`}
            disabled={isInviting}
            onPress={() => setRole("admin")}
          >
            <Text
              className={`text-center font-medium ${
                role === "admin" ? "text-accent-foreground" : "text-foreground"
              }`}
            >
              Admin
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );

  const renderInvitationSuccess = () => (
    <View className="gap-4">
      <View className="items-center gap-2 rounded-lg bg-success/10 p-4">
        <Ionicons color={successColor} name="checkmark-circle" size={48} />
        <Text className="text-center font-semibold text-lg text-success">
          Invitation Sent!
        </Text>
        <Text className="text-center text-muted-foreground text-sm">
          Copy the invitation link below to share with {email}
        </Text>
      </View>

      <View>
        <Text className="mb-2 font-medium text-foreground text-sm">
          Invitation Link
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 rounded-lg border border-divider bg-background px-4 py-3 text-foreground text-sm"
            editable={false}
            selectTextOnFocus
            value={invitationUrl || ""}
          />
          <Pressable
            className="rounded-lg bg-accent px-4 py-3 active:opacity-70"
            onPress={handleCopy}
          >
            {copied ? (
              <Ionicons
                color={accentForegroundColor}
                name="checkmark"
                size={20}
              />
            ) : (
              <Ionicons
                color={accentForegroundColor}
                name="copy-outline"
                size={20}
              />
            )}
          </Pressable>
        </View>
        {copied && <Text className="mt-1 text-success text-xs">Copied!</Text>}
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-md p-6" variant="secondary">
          <Card.Header className="mb-4">
            <Card.Title className="text-xl">Invite Team Member</Card.Title>
            <Card.Description>
              Send an invitation to join your organization
            </Card.Description>
          </Card.Header>

          <Card.Body className="gap-4">
            {invitationUrl ? renderInvitationSuccess() : renderInvitationForm()}
          </Card.Body>

          <Card.Footer className="mt-4 flex-row gap-2">
            {invitationUrl ? (
              <Pressable
                className="flex-1 rounded-lg bg-accent px-4 py-3 active:opacity-70"
                onPress={handleClose}
              >
                <Text className="text-center font-semibold text-accent-foreground">
                  Done
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  className="flex-1 rounded-lg border border-divider px-4 py-3 active:opacity-70"
                  disabled={isInviting}
                  onPress={handleClose}
                >
                  <Text className="text-center font-medium text-foreground">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 rounded-lg bg-accent px-4 py-3 active:opacity-70"
                  disabled={isInviting || !email.trim()}
                  onPress={handleInvite}
                >
                  {isInviting ? (
                    <ActivityIndicator
                      color={accentForegroundColor}
                      size="small"
                    />
                  ) : (
                    <Text className="text-center font-semibold text-accent-foreground">
                      Send Invitation
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </Card.Footer>
        </Card>
      </View>
    </Modal>
  );
}
