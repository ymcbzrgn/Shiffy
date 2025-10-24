import { Redirect } from 'expo-router';

export default function Index() {
  // Uygulama açılınca direkt user-select'e yönlendir
  return <Redirect href="/(auth)/user-select" />;
}
