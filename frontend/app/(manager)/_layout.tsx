import { Stack } from 'expo-router';

export default function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1193d4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Yönetici Paneli',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="employees/index" 
        options={{ 
          title: 'Çalışan Listesi',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="employees/add" 
        options={{ 
          title: 'Yeni Çalışan',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
