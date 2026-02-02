/**
 * Contact Repository Interface - Domain Layer
 * Defines the contract for contact data persistence operations
 *
 * Clean Architecture: This interface belongs to the Domain Layer
 * - Defines the contract that Infrastructure layer must implement
 * - Contains no implementation details
 * - Framework agnostic
 */

/**
 * @interface IContactRepository
 * @description Repository interface for Contact entity persistence
 */
class IContactRepository {
  /**
   * Create a new contact submission
   * @param {Contact} contact - Contact entity to persist
   * @returns {Promise<Contact>} Created contact with ID
   * @throws {Error} If creation fails
   */
  async create(contact) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Find a contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise<Contact|null>} Contact entity or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find all contacts with optional filtering
   * @param {object} options - Query options
   * @param {string} [options.status] - Filter by status
   * @param {number} [options.limit] - Maximum number of results
   * @param {number} [options.offset] - Number of results to skip
   * @param {string} [options.sortBy] - Field to sort by
   * @param {string} [options.sortOrder] - Sort order ('asc' or 'desc')
   * @returns {Promise<{ data: Contact[], total: number }>} Paginated contacts
   */
  async findAll(options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find contacts by email
   * @param {string} email - Email address
   * @returns {Promise<Contact[]>} Array of contacts from this email
   */
  async findByEmail(email) {
    throw new Error('Method not implemented: findByEmail');
  }

  /**
   * Find contacts by status
   * @param {string} status - Contact status
   * @returns {Promise<Contact[]>} Array of contacts with this status
   */
  async findByStatus(status) {
    throw new Error('Method not implemented: findByStatus');
  }

  /**
   * Update a contact
   * @param {string} id - Contact ID
   * @param {object} data - Data to update
   * @returns {Promise<Contact>} Updated contact entity
   * @throws {Error} If contact not found or update fails
   */
  async update(id, data) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Update contact status
   * @param {string} id - Contact ID
   * @param {string} status - New status
   * @returns {Promise<Contact>} Updated contact entity
   * @throws {Error} If contact not found or update fails
   */
  async updateStatus(id, status) {
    throw new Error('Method not implemented: updateStatus');
  }

  /**
   * Delete a contact
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Check if a contact exists
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    throw new Error('Method not implemented: exists');
  }

  /**
   * Count contacts with optional filtering
   * @param {object} [filter] - Optional filter criteria
   * @returns {Promise<number>} Count of contacts
   */
  async count(filter = {}) {
    throw new Error('Method not implemented: count');
  }

  /**
   * Find contacts submitted within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Contact[]>} Array of contacts within date range
   */
  async findByDateRange(startDate, endDate) {
    throw new Error('Method not implemented: findByDateRange');
  }

  /**
   * Delete contacts older than specified date
   * @param {Date} date - Cutoff date
   * @returns {Promise<number>} Number of deleted contacts
   */
  async deleteOlderThan(date) {
    throw new Error('Method not implemented: deleteOlderThan');
  }
}

export default IContactRepository;
