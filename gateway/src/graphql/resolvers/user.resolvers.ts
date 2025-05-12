import { UserService } from '../../services/user.service';

type UserSearchResult = {
  users: any[];
  total: number;
  totalPages: number;
  page: number;
};

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface UpdateProfileInput {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface UpdatePreferencesInput {
  favoriteGenres: string[];
  preferredLanguages: string[];
  contentRating: string[];
}

export const userResolvers = {
  Query: {
    users: async (_: any, { page = 1, limit = 10 }: { page: number; limit: number }) => {
      try {
        const result = await UserService.searchUsers('', page, limit) as UserSearchResult;
        return {
          edges: result.users,
          pageInfo: {
            hasNextPage: page < result.totalPages,
            hasPreviousPage: page > 1,
            currentPage: result.page,
            totalPages: result.totalPages,
          },
          totalCount: result.total,
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    },

    user: async (_: any, { id }: { id: string }) => {
      try {
        return await UserService.getUserById(id);
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
      }
    },

    searchUsers: async (_: any, { query }: { query: string }) => {
      try {
        return await UserService.searchUsers(query);
      } catch (error) {
        console.error('Error searching users:', error);
        throw new Error('Failed to search users');
      }
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
      try {
        return await UserService.register(input);
      } catch (error) {
        console.error('Error registering user:', error);
        throw new Error('Failed to register user');
      }
    },

    login: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        return await UserService.login(email, password);
      } catch (error) {
        console.error('Error logging in:', error);
        throw new Error('Failed to login');
      }
    },

    updateProfile: async (_: any, { input }: { input: UpdateProfileInput }) => {
      try {
        const userId = "test-user-id"; // ID temporaire pour les tests
        return await UserService.updateUser(userId, input);
      } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile');
      }
    },

    updatePreferences: async (_: any, { input }: { input: UpdatePreferencesInput }) => {
      try {
        const userId = "681fb8cbe88a07ac47ae8ddb"; // ID temporaire pour les tests
        return await UserService.updatePreferences(userId, input);
      } catch (error) {
        console.error('Error updating preferences:', error);
        throw new Error('Failed to update preferences');
      }
    }
  },
};
