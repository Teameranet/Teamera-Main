/**
 * Contact Entity - Domain Layer
 * Represents the core business logic for contact submissions
 * This entity is framework-agnostic and contains only business rules
 */

class Contact {
  constructor({ id, name, email, message, status, submittedAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.message = message;
    this.status = status || ContactStatus.PENDING;
    this.submittedAt = submittedAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.validate();
  }

  /**
   * Validates the contact entity
   * @throws {Error} If validation fails
   */
  validate() {
    const errors = [];

    if (!this.name || typeof this.name !== 'string') {
      errors.push('Name is required');
    } else if (this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (this.name.trim().length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    if (!this.email || typeof this.email !== 'string') {
      errors.push('Email is required');
    } else if (!Contact.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (!this.message || typeof this.message !== 'string') {
      errors.push('Message is required');
    } else if (this.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    } else if (this.message.trim().length > 2000) {
      errors.push('Message must be less than 2000 characters');
    }

    if (!Object.values(ContactStatus).includes(this.status)) {
      errors.push('Invalid status');
    }

    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.name = 'ValidationError';
      error.errors = errors;
      throw error;
    }
  }

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Updates the contact status
   * @param {string} newStatus - New status value
   */
  updateStatus(newStatus) {
    if (!Object.values(ContactStatus).includes(newStatus)) {
      throw new Error('Invalid status');
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Marks the contact as read/reviewed
   */
  markAsReviewed() {
    this.updateStatus(ContactStatus.REVIEWED);
  }

  /**
   * Marks the contact as responded
   */
  markAsResponded() {
    this.updateStatus(ContactStatus.RESPONDED);
  }

  /**
   * Archives the contact
   */
  archive() {
    this.updateStatus(ContactStatus.ARCHIVED);
  }

  /**
   * Converts entity to plain object
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      message: this.message,
      status: this.status,
      submittedAt: this.submittedAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates a Contact instance from raw data
   * @param {object} data - Raw contact data
   * @returns {Contact}
   */
  static create(data) {
    return new Contact({
      id: data.id || Contact.generateId(),
      name: data.name?.trim(),
      email: data.email?.toLowerCase().trim(),
      message: data.message?.trim(),
      status: data.status || ContactStatus.PENDING,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
    });
  }

  /**
   * Generates a unique ID
   * @returns {string}
   */
  static generateId() {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Contact status enumeration
 */
const ContactStatus = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESPONDED: 'responded',
  ARCHIVED: 'archived'
});

export { Contact, ContactStatus };
export default Contact;
