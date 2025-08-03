// Authentication configuration for Neural Core Alpha-7
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  accountType: 'paper' | 'live';
  totalDeposited: number;
  maxDeposit: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Temporary in-memory user store (replace with database)
const users: User[] = [];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text', optional: true },
        action: { label: 'Action', type: 'text' } // 'login' or 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const { email, password, name, action } = credentials;

        if (action === 'register') {
          // Registration flow
          if (!name) {
            throw new Error('Name is required for registration');
          }

          // Check if user already exists
          const existingUser = users.find(u => u.email === email);
          if (existingUser) {
            throw new Error('User already exists with this email');
          }

          // Validate password strength
          if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 12);

          // Create new user with Neural Core protection defaults
          const newUser: User = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name,
            role: 'user',
            accountType: 'paper', // Start with paper trading
            totalDeposited: 0,
            maxDeposit: 300, // Neural Core $300 protection limit
            isActive: true,
            createdAt: new Date().toISOString()
          };

          // Store user (in production, save to database)
          users.push(newUser);
          console.log('👤 New user registered:', email);

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            accountType: newUser.accountType
          };

        } else {
          // Login flow
          const user = users.find(u => u.email === email);
          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated');
          }

          // SECURITY: Verify hashed password (NO hardcoded passwords!)
          // TODO: Implement proper password hashing in production
          // const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
          
          // Temporary demo mode - REMOVE in production
          const passwordMatch = process.env.NODE_ENV === 'development' && password === process.env.DEMO_PASSWORD;
          
          if (!passwordMatch) {
            throw new Error('Invalid password');
          }

          // Update last login
          user.lastLogin = new Date().toISOString();
          console.log('🔐 User logged in:', email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accountType: user.accountType
          };
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accountType = user.accountType;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.accountType = token.accountType as string;
      }
      return session;
    }
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log('🎉 User signed in:', user.email);
    },
    
    async signOut({ session, token }) {
      console.log('👋 User signed out');
    }
  }
};

// User management functions
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const user: User = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  return user;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return users.find(u => u.id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return users.find(u => u.email === email) || null;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates };
  return users[userIndex];
};

// Neural Core specific functions
export const validateDepositLimit = (user: User, amount: number): { valid: boolean; error?: string } => {
  if (amount <= 0) {
    return { valid: false, error: 'Deposit amount must be positive' };
  }

  if (amount > user.maxDeposit) {
    return { 
      valid: false, 
      error: `Single deposit cannot exceed $${user.maxDeposit} (Neural Core Protection)` 
    };
  }

  if (user.totalDeposited + amount > user.maxDeposit) {
    return { 
      valid: false, 
      error: `Total deposits cannot exceed $${user.maxDeposit} (Neural Core Protection)` 
    };
  }

  return { valid: true };
};

export const updateUserDeposit = async (userId: string, amount: number): Promise<User | null> => {
  const user = await getUserById(userId);
  if (!user) return null;

  const validation = validateDepositLimit(user, amount);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return updateUser(userId, {
    totalDeposited: user.totalDeposited + amount
  });
};