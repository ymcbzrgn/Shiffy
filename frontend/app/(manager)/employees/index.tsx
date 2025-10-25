import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { EmployeeCard } from '../../../components/features/EmployeeCard';
import { Button } from '../../../components/ui/Button';
import { Employee } from '../../../types';
import { getEmployees, searchEmployees } from '../../../services/employee';

export default function EmployeeListScreen() {
  const router = useRouter();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees('mgr-1'); // Mock manager ID
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      Alert.alert('Hata', 'Çalışanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query) {
      setFilteredEmployees(employees);
      return;
    }
    
    try {
      const results = await searchEmployees('mgr-1', query);
      setFilteredEmployees(results);
    } catch (error) {
      Alert.alert('Hata', 'Arama başarısız');
    }
  };

  const handleEmployeePress = (id: string) => {
    Alert.alert('Çalışan Detayı', `Phase 6'da implement edilecek. ID: ${id}`);
    // router.push(`/(manager)/employees/${id}` as any);
  };

  const handleAddEmployee = () => {
    router.push('/(manager)/employees/add' as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1193d4" />
        <Text style={styles.loadingText}>Çalışanlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Çalışan Listesi</Text>
        <Button
          title="Yeni Çalışan"
          onPress={handleAddEmployee}
          variant="primary"
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={24} color="#617c89" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Çalışan ara..."
            placeholderTextColor="#617c89"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <MaterialIcons
              name="close"
              size={20}
              color="#617c89"
              style={styles.clearIcon}
              onPress={() => handleSearch('')}
            />
          )}
        </View>
      </View>

      {/* Employee List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredEmployees.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={64} color="#617c89" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Çalışan bulunamadı' : 'Henüz çalışan eklenmemiş'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Farklı bir arama yapın' : 'Yeni çalışan eklemek için yukarıdaki butona tıklayın'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {filteredEmployees.length} çalışan bulundu
            </Text>
            {filteredEmployees.map(employee => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onPress={handleEmployeePress}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#617c89',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111618',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f7f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111618',
  },
  clearIcon: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#617c89',
    marginBottom: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#617c89',
    marginTop: 8,
    textAlign: 'center',
  },
});
