// Employee authentication service (custom backend, not Supabase)

const USE_MOCK = true;

interface LoginResponse {
  success: boolean;
  token?: string;
  employee?: {
    id: string;
    username: string;
    full_name: string;
    first_login: boolean;
  };
  message?: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Mock employee credentials
const MOCK_CREDENTIALS = {
  'ahmet.ergun': { password: 'Password123!', first_login: false },
  'zeynep.yilmaz': { password: 'Shf9kL2pQx', first_login: true },
  'mehmet.kaya': { password: 'ShfA1b2C3d4', first_login: true },
  'ayse.demir': { password: 'Test1234', first_login: false },
  'can.ozturk': { password: 'Shiffy2025', first_login: false },
  'elif.sahin': { password: 'ElifPass99', first_login: false },
};

export async function employeeLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const credentials = MOCK_CREDENTIALS[username as keyof typeof MOCK_CREDENTIALS];

    if (!credentials) {
      return {
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı',
      };
    }

    if (credentials.password !== password) {
      return {
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı',
      };
    }

    // Find employee data (from employee service mock data)
    const employeeData = {
      '1': { id: '1', username: 'ahmet.ergun', full_name: 'Ahmet Ergün', first_login: false },
      '2': { id: '2', username: 'zeynep.yilmaz', full_name: 'Zeynep Yılmaz', first_login: true },
      '3': { id: '3', username: 'mehmet.kaya', full_name: 'Mehmet Kaya', first_login: true },
      '4': { id: '4', username: 'ayse.demir', full_name: 'Ayşe Demir', first_login: false },
      '5': { id: '5', username: 'can.ozturk', full_name: 'Can Öztürk', first_login: false },
      '6': { id: '6', username: 'elif.sahin', full_name: 'Elif Şahin', first_login: false },
    };

    const employee = Object.values(employeeData).find(e => e.username === username);

    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      employee: employee || {
        id: '1',
        username,
        full_name: 'Mock Employee',
        first_login: credentials.first_login,
      },
    };
  }

  // Real API implementation
  const response = await fetch('/api/employee/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return {
      success: false,
      message: 'Giriş başarısız',
    };
  }

  return response.json();
}

export async function employeeChangePassword(
  currentPassword: string,
  newPassword: string,
  isFirstLogin: boolean
): Promise<ChangePasswordResponse> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For first login, we don't verify current password
    // Just accept the new password
    return {
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    };
  }

  // Real API implementation
  const response = await fetch('/api/employee/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_password: isFirstLogin ? undefined : currentPassword,
      new_password: newPassword,
      is_first_login: isFirstLogin,
    }),
  });

  if (!response.ok) {
    return {
      success: false,
      message: 'Şifre değiştirilemedi',
    };
  }

  return response.json();
}
