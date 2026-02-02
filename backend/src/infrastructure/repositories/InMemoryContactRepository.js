/**
 * InMemoryContactRepository - Infrastructure Layer
 * In-memory implementation of the Contact Repository interface
 *
 * Clean Architecture: This is an Infrastructure layer component
 * It implements the domain repository interface without the domain knowing
 * about the implementation details (in-memory storage in this case).
 */

import IContactRepository from '../../domain/repositories/IContactRepository.js';

class InMemoryContactRepository extends IContactRepository {
  constructor() {
    super();
    this.contacts = new Map();
  }

  /**
   * Generate a unique ID for contacts
   * @returns {string}
   */
  generateId() {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new contact submission
   * @param {object} contactData - Contact data to persist
   * @returns {Promise<object>} Created contact with ID
   */
  async create(contactData) {
    const id = contactData.id || this.generateId();
    const contact = {
      id,
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
      status: contactData.status || 'pending',
      submittedAt: contactData.submittedAt || new Date(),
      updatedAt: new Date(),
    };

    this.contacts.set(id, contact);
    return { ...contact };
  }

  /**
   * Find a contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise<object|null>} Contact or null if not found
   */
  async findById(id) {
    const contact = this.contacts.get(id);
    return contact ? { ...contact } : null;
  }

  /**
   * Find all contacts with optional filtering
   * @param {object} options - Query options
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async findAll(options = {}) {
    const { status, limit = 10, offset = 0, sortBy = 'submittedAt', sortOrder = 'desc' } = options;

    let contacts = Array.from(this.contacts.values());

    // Filter by status if provided
    if (status) {
      contacts = contacts.filter((c) => c.status === status);
    }

    // Sort contacts
    contacts.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });

    const total = contacts.length;

    // Apply pagination
    contacts = contacts.slice(offset, offset + limit);

    return {
      data: contacts.map((c) => ({ ...c })),
      total,
    };
  }

  /**
   * Find contacts by email
   * @param {string} email - Email address
   * @returns {Promise<object[]>}
   */
  async findByEmail(email) {
    const contacts = Array.from(this.contacts.values()).filter(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    return contacts.map((c) => ({ ...c }));
  }

  /**
   * Find contacts by status
   * @param {string} status - Contact status
   * @returns {Promise<object[]>}
   */
  async findByStatus(status) {
    const contacts = Array.from(this.contacts.values()).filter(
      (c) => c.status === status
    );
    return contacts.map((c) => ({ ...c }));
  }

  /**
   * Update a contact
   * @param {string} id - Contact ID
   * @param {object} data - Data to update
   * @returns {Promise<object>} Updated contact
   */
  async update(id, data) {
    const contact = this.contacts.get(id);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const updatedContact = {
      ...contact,
      ...data,
      id, // Ensure ID is not changed
      updatedAt: new Date(),
    };

    this.contacts.set(id, updatedContact);
    return { ...updatedContact };
  }

  /**
   * Update contact status
   * @param {string} id - Contact ID
   * @param {string} status - New status
   * @returns {Promise<object>} Updated contact
   */
  async updateStatus(id, status) {
    const contact = this.contacts.get(id);
    if (!contact) {
      return null;
    }

    contact.status = status;
    contact.updatedAt = new Date();

    this.contacts.set(id, contact);
    return { ...contact };
  }

  /**
   * Delete a contact
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    return this.contacts.delete(id);
  }

  /**
   * Check if a contact exists
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    return this.contacts.has(id);
  }

  /**
   * Count contacts with optional filtering
   * @param {object} filter - Optional filter criteria
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    if (Object.keys(filter).length === 0) {
      return this.contacts.size;
    }

    let contacts = Array.from(this.contacts.values());

    if (filter.status) {
      contacts = contacts.filter((c) => c.status === filter.status);
    }

    return contacts.length;
  }

  /**
   * Find contacts submitted within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<object[]>}
   */
  async findByDateRange(startDate, endDate) {
    const contacts = Array.from(this.contacts.values()).filter((c) => {
      const submittedAt = new Date(c.submittedAt);
      return submittedAt >= startDate && submittedAt <= endDate;
    });
    return contacts.map((c) => ({ ...c }));
  }

  /**
   * Delete contacts older than specified date
   * @param {Date} date - Cutoff date
   * @returns {Promise<number>} Number of deleted contacts
   */
  async deleteOlderThan(date) {
    let deletedCount = 0;

    for (const [id, contact] of this.contacts) {
      if (new Date(contact.submittedAt) < date) {
        this.contacts.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Clear all contacts (useful for testing)
   * @returns {Promise<void>}
   */
  async clear() {
    this.contacts.clear();
  }

  /**
   * Get all contacts as array (useful for debugging)
   * @returns {Promise<object[]>}
   */
  async toArray() {
    return Array.from(this.contacts.values()).map((c) => ({ ...c }));
  }
}

export default InMemoryContactRepository;
