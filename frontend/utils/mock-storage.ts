// Simple mock storage for logged-in user (temporary until AsyncStorage in Phase 10)

interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  user_type: 'manager' | 'employee';
}

let currentUser: User | null = null;

export const setCurrentUser = (user: User) => {
  currentUser = user;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const clearCurrentUser = () => {
  currentUser = null;
};
