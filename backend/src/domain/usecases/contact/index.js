/**
 * Contact Use Cases - Domain Layer
 * Business rules for contact form operations
 *
 * Clean Architecture: Use Cases contain application-specific business rules
 * They orchestrate the flow of data to and from entities and direct
 * those entities to use their enterprise-wide business rules.
 */

/**
 * Submit Contact Form Use Case
 * Handles the business logic for submitting a contact form
 */
export class SubmitContactUseCase {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  /**
   * Execute the use case
   * @param {object} input - Contact form input data
   * @param {string} input.name - Contact name
   * @param {string} input.email - Contact email
   * @param {string} input.message - Contact message
   * @returns {Promise<object>} - Result with created contact
   */
  async execute(input) {
    const { name, email, message } = input;

    // Validate input
    const validation = this.validate(input);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        code: 'VALIDATION_ERROR',
      };
    }

    // Create contact entity
    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      status: 'pending',
      submittedAt: new Date(),
    };

    try {
      // Persist contact through repository
      const contact = await this.contactRepository.create(contactData);

      return {
        success: true,
        data: {
          id: contact.id,
          status: contact.status,
          message: 'Your message has been received and will be reviewed shortly.',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'SUBMISSION_ERROR',
      };
    }
  }

  /**
   * Validate input data
   * @param {object} input
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validate(input) {
    const errors = [];

    if (!input.name || typeof input.name !== 'string' || input.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!input.email || !this.isValidEmail(input.email)) {
      errors.push('Valid email is required');
    }

    if (!input.message || typeof input.message !== 'string' || input.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (input.message && input.message.length > 2000) {
      errors.push('Message must be less than 2000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Get All Contacts Use Case
 * Retrieves all contact submissions (admin functionality)
 */
export class GetAllContactsUseCase {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  /**
   * Execute the use case
   * @param {object} options - Query options
   * @param {string} options.status - Filter by status
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<object>} - Paginated contacts list
   */
  async execute(options = {}) {
    try {
      const result = await this.contactRepository.findAll(options);

      return {
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: Math.ceil(result.total / (options.limit || 10)),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'FETCH_ERROR',
      };
    }
  }
}

/**
 * Get Contact By ID Use Case
 * Retrieves a specific contact submission
 */
export class GetContactByIdUseCase {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  /**
   * Execute the use case
   * @param {string} id - Contact ID
   * @returns {Promise<object>} - Contact data or error
   */
  async execute(id) {
    if (!id) {
      return {
        success: false,
        error: 'Contact ID is required',
        code: 'VALIDATION_ERROR',
      };
    }

    try {
      const contact = await this.contactRepository.findById(id);

      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          code: 'NOT_FOUND',
        };
      }

      return {
        success: true,
        data: contact,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'FETCH_ERROR',
      };
    }
  }
}

/**
 * Update Contact Status Use Case
 * Updates the status of a contact submission
 */
export class UpdateContactStatusUseCase {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  /**
   * Valid statuses
   */
  static VALID_STATUSES = ['pending', 'reviewed', 'responded', 'archived'];

  /**
   * Execute the use case
   * @param {string} id - Contact ID
   * @param {string} status - New status
   * @returns {Promise<object>} - Updated contact or error
   */
  async execute(id, status) {
    if (!id) {
      return {
        success: false,
        error: 'Contact ID is required',
        code: 'VALIDATION_ERROR',
      };
    }

    if (!UpdateContactStatusUseCase.VALID_STATUSES.includes(status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${UpdateContactStatusUseCase.VALID_STATUSES.join(', ')}`,
        code: 'VALIDATION_ERROR',
      };
    }

    try {
      const contact = await this.contactRepository.updateStatus(id, status);

      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          code: 'NOT_FOUND',
        };
      }

      return {
        success: true,
        data: contact,
        message: `Contact status updated to '${status}'`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'UPDATE_ERROR',
      };
    }
  }
}

/**
 * Delete Contact Use Case
 * Deletes a contact submission
 */
export class DeleteContactUseCase {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  /**
   * Execute the use case
   * @param {string} id - Contact ID to delete
   * @returns {Promise<object>} - Result of deletion
   */
  async execute(id) {
    if (!id) {
      return {
        success: false,
        error: 'Contact ID is required',
        code: 'VALIDATION_ERROR',
      };
    }

    try {
      const deleted = await this.contactRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Contact not found',
          code: 'NOT_FOUND',
        };
      }

      return {
        success: true,
        message: 'Contact deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'DELETE_ERROR',
      };
    }
  }
}

/**
 * Get Contact Statistics Use Case
 * Retrieves statistics about contact submissions
 */
export class GetContactStatisticsUseCase {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  /**
   * Execute the use case
   * @returns {Promise<object>} - Contact statistics
   */
  async execute() {
    try {
      const [total, pending, reviewed, responded, archived] = await Promise.all([
        this.contactRepository.count(),
        this.contactRepository.count({ status: 'pending' }),
        this.contactRepository.count({ status: 'reviewed' }),
        this.contactRepository.count({ status: 'responded' }),
        this.contactRepository.count({ status: 'archived' }),
      ]);

      return {
        success: true,
        data: {
          total,
          byStatus: {
            pending,
            reviewed,
            responded,
            archived,
          },
          pendingRate: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
          responseRate: total > 0 ? ((responded / total) * 100).toFixed(1) : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'STATISTICS_ERROR',
      };
    }
  }
}

// Export all use cases
export default {
  SubmitContactUseCase,
  GetAllContactsUseCase,
  GetContactByIdUseCase,
  UpdateContactStatusUseCase,
  DeleteContactUseCase,
  GetContactStatisticsUseCase,
};
