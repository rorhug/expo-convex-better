import { Redirect, useGlobalSearchParams } from "expo-router";

export default function Home() {
  const { orgId } = useGlobalSearchParams<{ orgId: string }>();

  // Redirect to the tabs route when accessing the drawer index
  return <Redirect href={`/${orgId}/(drawer)/(tabs)`} />;
}
