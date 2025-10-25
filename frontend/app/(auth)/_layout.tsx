import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="user-select" />
      <Stack.Screen name="manager-login" />
      <Stack.Screen name="manager-register" />
      <Stack.Screen name="employee-login" />
      <Stack.Screen name="employee-password-reset" />
    </Stack>
  );
}
