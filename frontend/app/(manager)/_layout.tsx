import { Stack } from 'expo-router';

export default function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Tüm manager ekranlarında navigation header'ı gizle
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Yönetici Paneli',
        }} 
      />
      <Stack.Screen 
        name="employees/index" 
        options={{ 
          title: 'Çalışan Listesi',
        }} 
      />
      <Stack.Screen 
        name="employees/add" 
        options={{ 
          title: 'Yeni Çalışan',
        }} 
      />
      <Stack.Screen 
        name="employees/[id]" 
        options={{ 
          title: 'Çalışan Detayları',
        }} 
      />
      <Stack.Screen 
        name="shift-review" 
        options={{ 
          title: 'Shift İncelemesi',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Ayarlar',
        }} 
      />
    </Stack>
  );
}
