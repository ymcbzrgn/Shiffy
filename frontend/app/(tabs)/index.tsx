import { View, Text, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
  
  return (
    <ScrollView className='flex-1 bg-[#f6f7f8] dark:bg-[#101c22]'>
      <View className='p-6'>
        <Text className='text-3xl font-bold text-[#111618] dark:text-[#f0f3f4] mb-2'>
           Shiffy Setup Test
        </Text>
        <Text className='text-[#617c89] dark:text-[#a0b8c4] mb-8'>
          NativeWind ve UI componentleri test ediliyor
        </Text>
        
        <Card className='mb-4'>
          <Text className='text-lg font-bold text-[#111618] dark:text-[#f0f3f4] mb-4'>
            Test Card Component
          </Text>
          <Text className='text-[#617c89] dark:text-[#a0b8c4]'>
            Bu bir test kartı. Dark mode'u dene!
          </Text>
        </Card>
        
        <Input
          label='Email Test'
          value={email}
          onChangeText={setEmail}
          placeholder='test@example.com'
          keyboardType='email-address'
        />
        
        <Button
          title={loading ? 'Yükleniyor...' : 'Test Button'}
          onPress={handleTest}
          loading={loading}
          className='mb-4'
        />
        
        <Button
          title='Secondary Button'
          onPress={() => alert('Secondary tıklandı!')}
          variant='secondary'
          className='mb-4'
        />
        
        <Button
          title='Danger Button'
          onPress={() => alert('Danger tıklandı!')}
          variant='danger'
        />
        
        <View className='mt-8 p-4 bg-primary rounded-lg'>
          <Text className='text-white text-center font-bold'>
             AŞAMA 1 Tamamlanıyor!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
