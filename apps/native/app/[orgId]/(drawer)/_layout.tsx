import { Ionicons } from "@expo/vector-icons";
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import { useCallback } from "react";
import { Text, View } from "react-native";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { data: orgs } = authClient.useListOrganizations();
  const router = useRouter();
  const { orgId } = useGlobalSearchParams();
  const themeColorForeground = useThemeColor("foreground");
  const themeColorAccent = useThemeColor("accent");

  const handleOrgSelect = (id: string) => {
    router.replace(`/${id}/(drawer)/(tabs)`);
  };

  return (
    <DrawerContentScrollView {...props}>
      <View className="mb-2 border-divider border-b p-4">
        <Text className="font-bold text-foreground text-lg">Organizations</Text>
      </View>

      {orgs?.map((org) => (
        <DrawerItem
          activeTintColor={themeColorAccent}
          focused={org.id === orgId}
          icon={({ size, color }) => (
            <Ionicons color={color} name="business-outline" size={size} />
          )}
          inactiveTintColor={themeColorForeground}
          key={org.id}
          label={org.name}
          onPress={() => handleOrgSelect(org.id)}
        />
      ))}

      <View className="mt-4 border-divider border-t pt-2">
        <DrawerItem
          icon={({ size, color }) => (
            <Ionicons color={color} name="log-out-outline" size={size} />
          )}
          inactiveTintColor={themeColorForeground}
          label="Sign Out"
          onPress={() =>
            authClient.signOut().then(() => router.replace("/login"))
          }
        />
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTitleStyle: {
          fontWeight: "600",
          color: themeColorForeground,
        },
        headerRight: renderThemeToggle,
        drawerStyle: { backgroundColor: themeColorBackground },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Dashboard",
          drawerLabel: "Dashboard",
        }}
      />
      <Drawer.Screen
        name="index"
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="todos"
        options={{ drawerItemStyle: { display: "none" } }}
      />
    </Drawer>
  );
}

export default DrawerLayout;
