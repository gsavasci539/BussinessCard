// Mock data for users
const mockUsers = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'user',
    is_active: true,
    visit_count: 1,
    last_visited_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    visit_count: 1,
    last_visited_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    full_name: 'Regular User',
    role: 'user',
    is_active: true,
    visit_count: 1,
    last_visited_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

// Mock authentication state
let isAuthenticated = false;
let currentUser = null;

// Mock API functions
export const mockApi = {
  // Authentication
  async login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const user = mockUsers.find(u => u.username === username);
    if (user && ((username === 'admin' && password === 'admin123') || 
                (username === 'testuser' && password === 'test123') ||
                (username === 'user' && password === 'user123'))) {
      isAuthenticated = true;
      currentUser = { ...user };
      localStorage.setItem('mock_token', 'mock_jwt_token');
      localStorage.setItem('mock_user', JSON.stringify(user));
      return { 
        access_token: 'mock_jwt_token',
        user: { ...user }
      };
    }
    throw new Error('Invalid credentials');
  },

  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: 'user',
      is_active: true,
      visit_count: 0,
      created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return { message: 'User registered successfully', user: newUser };
  },

  async getCurrentUser() {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return currentUser;
  },

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 200));
    isAuthenticated = false;
    currentUser = null;
    localStorage.removeItem('mock_token');
    localStorage.removeItem('mock_user');
    return { message: 'Logged out successfully' };
  },

  // Mock other API endpoints as needed
  async getUsers() {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return mockUsers;
  },

  // Add more mock API methods as needed
};

// Initialize mock auth state from localStorage
const savedUser = localStorage.getItem('mock_user');
if (savedUser) {
  isAuthenticated = true;
  currentUser = JSON.parse(savedUser);
}

export default mockApi;
