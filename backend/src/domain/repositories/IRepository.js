/**
 * Base Repository Interface - Domain Layer
 * Defines the contract that all repositories must follow
 *
 * Clean Architecture: Domain Layer
 * - Repository interfaces belong to the domain layer
 * - Concrete implementations belong to the infrastructure layer
 * - This ensures dependency inversion (domain doesn't depend on infrastructure)
 */

/**
 * @interface IRepository
 * @template T - Entity type
 *
 * Base repository interface that defines standard CRUD operations
 * All concrete repositories should implement these methods
 */
class IRepository {
  /**
   * Find an entity by its ID
   * @param {string} id - Entity ID
   * @returns {Promise<T|null>} Entity or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find all entities
   * @param {object} options - Query options (pagination, sorting, etc.)
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
   * @returns {Promise<{ data: T[], total: number, page: number, totalPages: number }>}
   */
  async findAll(options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find entities matching criteria
   * @param {object} criteria - Search criteria
   * @param {object} options - Query options
   * @returns {Promise<T[]>} Array of matching entities
   */
  async findByCriteria(criteria, options = {}) {
    throw new Error('Method not implemented: findByCriteria');
  }

  /**
   * Find a single entity matching criteria
   * @param {object} criteria - Search criteria
   * @returns {Promise<T|null>} Entity or null if not found
   */
  async findOne(criteria) {
    throw new Error('Method not implemented: findOne');
  }

  /**
   * Create a new entity
   * @param {T} entity - Entity to create
   * @returns {Promise<T>} Created entity with ID
   */
  async create(entity) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Create multiple entities
   * @param {T[]} entities - Entities to create
   * @returns {Promise<T[]>} Created entities with IDs
   */
  async createMany(entities) {
    throw new Error('Method not implemented: createMany');
  }

  /**
   * Update an existing entity
   * @param {string} id - Entity ID
   * @param {Partial<T>} data - Data to update
   * @returns {Promise<T|null>} Updated entity or null if not found
   */
  async update(id, data) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Update multiple entities matching criteria
   * @param {object} criteria - Search criteria
   * @param {Partial<T>} data - Data to update
   * @returns {Promise<number>} Number of updated entities
   */
  async updateMany(criteria, data) {
    throw new Error('Method not implemented: updateMany');
  }

  /**
   * Delete an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Delete multiple entities matching criteria
   * @param {object} criteria - Search criteria
   * @returns {Promise<number>} Number of deleted entities
   */
  async deleteMany(criteria) {
    throw new Error('Method not implemented: deleteMany');
  }

  /**
   * Check if an entity exists by ID
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    throw new Error('Method not implemented: exists');
  }

  /**
   * Check if any entity matches criteria
   * @param {object} criteria - Search criteria
   * @returns {Promise<boolean>} True if at least one entity matches
   */
  async existsByCriteria(criteria) {
    throw new Error('Method not implemented: existsByCriteria');
  }

  /**
   * Count all entities
   * @returns {Promise<number>} Total count
   */
  async count() {
    throw new Error('Method not implemented: count');
  }

  /**
   * Count entities matching criteria
   * @param {object} criteria - Search criteria
   * @returns {Promise<number>} Count of matching entities
   */
  async countByCriteria(criteria) {
    throw new Error('Method not implemented: countByCriteria');
  }

  /**
   * Begin a transaction (if supported)
   * @returns {Promise<object>} Transaction context
   */
  async beginTransaction() {
    throw new Error('Method not implemented: beginTransaction');
  }

  /**
   * Commit a transaction
   * @param {object} transaction - Transaction context
   * @returns {Promise<void>}
   */
  async commitTransaction(transaction) {
    throw new Error('Method not implemented: commitTransaction');
  }

  /**
   * Rollback a transaction
   * @param {object} transaction - Transaction context
   * @returns {Promise<void>}
   */
  async rollbackTransaction(transaction) {
    throw new Error('Method not implemented: rollbackTransaction');
  }
}

/**
 * Query options for repository methods
 * @typedef {Object} QueryOptions
 * @property {number} [page=1] - Page number (1-based)
 * @property {number} [limit=10] - Items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {('asc'|'desc')} [sortOrder='asc'] - Sort order
 * @property {string[]} [select] - Fields to select
 * @property {string[]} [include] - Relations to include
 */

/**
 * Paginated result
 * @typedef {Object} PaginatedResult
 * @template T
 * @property {T[]} data - Array of entities
 * @property {number} total - Total number of entities
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 */

export { IRepository };
export default IRepository;
