/**
 * IUserRepository - User Repository Interface
 * Domain Layer - Repository Contract
 *
 * This interface defines the contract for user data persistence operations.
 * The actual implementation will be in the Infrastructure layer.
 * This follows the Dependency Inversion Principle - high-level modules
 * (domain/use cases) depend on abstractions, not concrete implementations.
 */

class IUserRepository {
  /**
   * Find a user by their unique ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>} - User entity or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find a user by their email address
   * @param {string} email - User email
   * @returns {Promise<User|null>} - User entity or null if not found
   */
  async findByEmail(email) {
    throw new Error('Method not implemented: findByEmail');
  }

  /**
   * Get all users with optional filters and pagination
   * @param {object} options - Query options
   * @param {object} options.filters - Filter criteria
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - 'asc' or 'desc'
   * @returns {Promise<{users: User[], total: number, page: number, totalPages: number}>}
   */
  async findAll(options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find users by a list of IDs
   * @param {string[]} ids - Array of user IDs
   * @returns {Promise<User[]>} - Array of User entities
   */
  async findByIds(ids) {
    throw new Error('Method not implemented: findByIds');
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Promise<User[]>} - Array of User entities
   */
  async findByRole(role) {
    throw new Error('Method not implemented: findByRole');
  }

  /**
   * Find users by status
   * @param {string} status - User status
   * @returns {Promise<User[]>} - Array of User entities
   */
  async findByStatus(status) {
    throw new Error('Method not implemented: findByStatus');
  }

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @param {object} options - Search options (pagination, etc.)
   * @returns {Promise<{users: User[], total: number}>}
   */
  async search(query, options = {}) {
    throw new Error('Method not implemented: search');
  }

  /**
   * Find users by skills
   * @param {string[]} skills - Array of skill names
   * @param {boolean} matchAll - Whether to match all skills or any
   * @returns {Promise<User[]>} - Array of User entities
   */
  async findBySkills(skills, matchAll = false) {
    throw new Error('Method not implemented: findBySkills');
  }

  /**
   * Create a new user
   * @param {User} user - User entity to create
   * @returns {Promise<User>} - Created user entity with ID
   */
  async create(user) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update an existing user
   * @param {User} user - User entity with updated data
   * @returns {Promise<User>} - Updated user entity
   */
  async update(user) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Update specific fields of a user
   * @param {string} id - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<User>} - Updated user entity
   */
  async updatePartial(id, updates) {
    throw new Error('Method not implemented: updatePartial');
  }

  /**
   * Delete a user by ID
   * @param {string} id - User ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Soft delete a user (mark as inactive/deleted)
   * @param {string} id - User ID
   * @returns {Promise<User>} - Updated user entity
   */
  async softDelete(id) {
    throw new Error('Method not implemented: softDelete');
  }

  /**
   * Check if a user exists by ID
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    throw new Error('Method not implemented: exists');
  }

  /**
   * Check if email is already taken
   * @param {string} email - Email to check
   * @param {string} excludeUserId - Optional user ID to exclude (for updates)
   * @returns {Promise<boolean>}
   */
  async emailExists(email, excludeUserId = null) {
    throw new Error('Method not implemented: emailExists');
  }

  /**
   * Count total users with optional filters
   * @param {object} filters - Filter criteria
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    throw new Error('Method not implemented: count');
  }

  /**
   * Update user's last activity timestamp
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  async updateLastActivity(id) {
    throw new Error('Method not implemented: updateLastActivity');
  }

  /**
   * Get user statistics
   * @param {string} id - User ID
   * @returns {Promise<object>} - User statistics
   */
  async getStatistics(id) {
    throw new Error('Method not implemented: getStatistics');
  }
}

export default IUserRepository;
