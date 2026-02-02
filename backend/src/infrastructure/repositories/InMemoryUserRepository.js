/**
 * In-Memory User Repository - Infrastructure Layer
 * Implementation of IUserRepository for development/testing
 *
 * Clean Architecture: Infrastructure Layer
 * - Contains concrete implementations of repository interfaces
 * - Framework-specific code (in this case, simple in-memory storage)
 * - Can be easily swapped with database implementations
 */

import { User } from '../../domain/entities/User.js';

class InMemoryUserRepository {
  constructor() {
    this.users = new Map();
    this.lastActivity = new Map();
  }

  /**
   * Generate a unique ID
   * @returns {string}
   */
  _generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Find a user by their unique ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    const userData = this.users.get(id);
    if (!userData) return null;
    return User.fromPersistence(userData);
  }

  /**
   * Find a user by their email address
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    for (const userData of this.users.values()) {
      if (userData.email.toLowerCase() === normalizedEmail) {
        return User.fromPersistence(userData);
      }
    }
    return null;
  }

  /**
   * Get all users with optional filters and pagination
   * @param {object} options - Query options
   * @returns {Promise<{users: User[], total: number, page: number, totalPages: number}>}
   */
  async findAll(options = {}) {
    const {
      filters = {},
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    let users = Array.from(this.users.values());

    // Apply filters
    if (filters.status) {
      users = users.filter((u) => u.status === filters.status);
    }
    if (filters.role) {
      users = users.filter((u) => u.role === filters.role);
    }

    // Sort
    users.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedUsers = users.slice(start, start + limit);

    return {
      users: paginatedUsers.map((u) => User.fromPersistence(u)),
      total,
      page,
      totalPages,
    };
  }

  /**
   * Find users by a list of IDs
   * @param {string[]} ids - Array of user IDs
   * @returns {Promise<User[]>}
   */
  async findByIds(ids) {
    const users = [];
    for (const id of ids) {
      const userData = this.users.get(id);
      if (userData) {
        users.push(User.fromPersistence(userData));
      }
    }
    return users;
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Promise<User[]>}
   */
  async findByRole(role) {
    const users = Array.from(this.users.values())
      .filter((u) => u.role === role)
      .map((u) => User.fromPersistence(u));
    return users;
  }

  /**
   * Find users by status
   * @param {string} status - User status
   * @returns {Promise<User[]>}
   */
  async findByStatus(status) {
    const users = Array.from(this.users.values())
      .filter((u) => u.status === status)
      .map((u) => User.fromPersistence(u));
    return users;
  }

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<{users: User[], total: number}>}
   */
  async search(query, options = {}) {
    const { limit = 10 } = options;
    const normalizedQuery = query.toLowerCase();

    const matchingUsers = Array.from(this.users.values())
      .filter(
        (u) =>
          u.name.toLowerCase().includes(normalizedQuery) ||
          u.email.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, limit)
      .map((u) => User.fromPersistence(u));

    return {
      users: matchingUsers,
      total: matchingUsers.length,
    };
  }

  /**
   * Find users by skills
   * @param {string[]} skills - Array of skill names
   * @param {boolean} matchAll - Whether to match all skills or any
   * @returns {Promise<User[]>}
   */
  async findBySkills(skills, matchAll = false) {
    const normalizedSkills = skills.map((s) => s.toLowerCase());

    const matchingUsers = Array.from(this.users.values()).filter((u) => {
      const userSkills = (u.skills || []).map((s) => s.toLowerCase());
      if (matchAll) {
        return normalizedSkills.every((skill) => userSkills.includes(skill));
      }
      return normalizedSkills.some((skill) => userSkills.includes(skill));
    });

    return matchingUsers.map((u) => User.fromPersistence(u));
  }

  /**
   * Create a new user
   * @param {User} user - User entity to create
   * @returns {Promise<User>}
   */
  async create(user) {
    const id = user.id || this._generateId();
    const userData = {
      ...user.toJSON(),
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, userData);
    return User.fromPersistence(userData);
  }

  /**
   * Update an existing user
   * @param {User} user - User entity with updated data
   * @returns {Promise<User>}
   */
  async update(user) {
    if (!this.users.has(user.id)) {
      throw new Error('User not found');
    }

    const existingData = this.users.get(user.id);
    const updatedData = {
      ...existingData,
      ...user.toJSON(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(user.id, updatedData);
    return User.fromPersistence(updatedData);
  }

  /**
   * Update specific fields of a user
   * @param {string} id - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<User>}
   */
  async updatePartial(id, updates) {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }

    const existingData = this.users.get(id);
    const updatedData = {
      ...existingData,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedData);
    return User.fromPersistence(updatedData);
  }

  /**
   * Delete a user by ID
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!this.users.has(id)) {
      return false;
    }
    this.users.delete(id);
    this.lastActivity.delete(id);
    return true;
  }

  /**
   * Soft delete a user (mark as inactive/deleted)
   * @param {string} id - User ID
   * @returns {Promise<User>}
   */
  async softDelete(id) {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }

    const existingData = this.users.get(id);
    const updatedData = {
      ...existingData,
      status: 'inactive',
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedData);
    return User.fromPersistence(updatedData);
  }

  /**
   * Check if a user exists by ID
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    return this.users.has(id);
  }

  /**
   * Check if email is already taken
   * @param {string} email - Email to check
   * @param {string} excludeUserId - Optional user ID to exclude
   * @returns {Promise<boolean>}
   */
  async emailExists(email, excludeUserId = null) {
    const normalizedEmail = email.toLowerCase().trim();
    for (const [id, userData] of this.users.entries()) {
      if (userData.email.toLowerCase() === normalizedEmail) {
        if (excludeUserId && id === excludeUserId) {
          continue;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Count total users with optional filters
   * @param {object} filters - Filter criteria
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    let users = Array.from(this.users.values());

    if (filters.status) {
      users = users.filter((u) => u.status === filters.status);
    }
    if (filters.role) {
      users = users.filter((u) => u.role === filters.role);
    }

    return users.length;
  }

  /**
   * Update user's last activity timestamp
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  async updateLastActivity(id) {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }
    this.lastActivity.set(id, new Date().toISOString());
  }

  /**
   * Get user statistics
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  async getStatistics(id) {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }

    const userData = this.users.get(id);
    return {
      userId: id,
      createdAt: userData.createdAt,
      lastActivity: this.lastActivity.get(id) || userData.createdAt,
      skillCount: (userData.skills || []).length,
      status: userData.status,
      role: userData.role,
    };
  }

  /**
   * Clear all users (for testing purposes)
   * @returns {Promise<void>}
   */
  async clear() {
    this.users.clear();
    this.lastActivity.clear();
  }

  /**
   * Seed initial data (for development)
   * @param {object[]} usersData - Array of user data
   * @returns {Promise<User[]>}
   */
  async seed(usersData) {
    const createdUsers = [];
    for (const userData of usersData) {
      const user = await this.create(User.create(userData));
      createdUsers.push(user);
    }
    return createdUsers;
  }
}

// Export as singleton or class
export { InMemoryUserRepository };
export default InMemoryUserRepository;
