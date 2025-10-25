// Mock employee data service

import { Employee } from '../types';

const USE_MOCK = true;

// Mock employees
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    manager_id: 'mgr-1',
    username: 'ahmet.ergun',
    full_name: 'Ahmet Ergün',
    first_login: false,
    manager_notes: 'Sabah vardiyalarını tercih ediyor. Hafta sonu çalışmayı sevmiyor.',
    status: 'active',
    created_at: '2025-01-15T10:00:00Z',
    last_login: '2025-01-24T09:30:00Z',
  },
  {
    id: '2',
    manager_id: 'mgr-1',
    username: 'zeynep.yilmaz',
    full_name: 'Zeynep Yılmaz',
    first_login: false,
    manager_notes: null,
    status: 'active',
    created_at: '2025-01-10T14:00:00Z',
    last_login: '2025-01-23T15:20:00Z',
  },
  {
    id: '3',
    manager_id: 'mgr-1',
    username: 'mehmet.kaya',
    full_name: 'Mehmet Kaya',
    first_login: true,
    manager_notes: 'Yeni çalışan. İlk giriş yapması gerekiyor.',
    status: 'active',
    created_at: '2025-01-20T16:00:00Z',
    last_login: null,
  },
  {
    id: '4',
    manager_id: 'mgr-1',
    username: 'ayse.demir',
    full_name: 'Ayşe Demir',
    first_login: false,
    manager_notes: 'İzinde. Şubat başında dönecek.',
    status: 'inactive',
    created_at: '2024-12-01T10:00:00Z',
    last_login: '2025-01-05T11:00:00Z',
  },
  {
    id: '5',
    manager_id: 'mgr-1',
    username: 'can.ozturk',
    full_name: 'Can Öztürk',
    first_login: false,
    manager_notes: null,
    status: 'active',
    created_at: '2025-01-12T12:00:00Z',
    last_login: '2025-01-24T08:45:00Z',
  },
  {
    id: '6',
    manager_id: 'mgr-1',
    username: 'elif.sahin',
    full_name: 'Elif Şahin',
    first_login: false,
    manager_notes: 'Akşam vardiyalarında çok iyi.',
    status: 'active',
    created_at: '2025-01-08T09:00:00Z',
    last_login: '2025-01-24T14:10:00Z',
  },
];

export async function getEmployees(managerId: string): Promise<Employee[]> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_EMPLOYEES;
  }
  
  // Real API implementation
  const response = await fetch(`/api/manager/${managerId}/employees`);
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
}

export async function searchEmployees(managerId: string, query: string): Promise<Employee[]> {
  const employees = await getEmployees(managerId);
  
  if (!query) return employees;
  
  const lowerQuery = query.toLowerCase();
  return employees.filter(emp =>
    emp.full_name.toLowerCase().includes(lowerQuery) ||
    emp.username.toLowerCase().includes(lowerQuery)
  );
}

// Generate random password (Shf + 8 random chars)
function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = 'Shf';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function addEmployee(
  managerId: string,
  fullName: string,
  username: string
): Promise<{ employee: Employee; password: string }> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if username exists
    if (MOCK_EMPLOYEES.some(e => e.username === username)) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }
    
    const password = generatePassword();
    const newEmployee: Employee = {
      id: 'emp-' + Date.now(),
      manager_id: managerId,
      username,
      full_name: fullName,
      first_login: true,
      manager_notes: null,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: null,
    };
    
    MOCK_EMPLOYEES.push(newEmployee);
    
    return { employee: newEmployee, password };
  }
  
  // Real API implementation
  const response = await fetch(`/api/manager/${managerId}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, username }),
  });
  
  if (!response.ok) throw new Error('Failed to add employee');
  return response.json();
}
