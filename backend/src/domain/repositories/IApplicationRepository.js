/**
 * Application Repository Interface - Domain Layer
 * Defines the contract for Application data persistence
 *
 * Clean Architecture: This is part of the Domain layer
 * Implementation details are in the Infrastructure layer
 */

/**
 * @interface IApplicationRepository
 * @description Interface for Application repository implementations
 */
class IApplicationRepository {
  /**
   * Find an application by its ID
   * @param {string} id - Application ID
   * @returns {Promise<Application|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find all applications with optional filters
   * @param {object} filters - Optional filtering criteria
   * @param {object} options - Pagination and sorting options
   * @returns {Promise<{ data: Application[], total: number, page: number, limit: number }>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find applications by project ID
   * @param {string} projectId - Project ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Application[]>}
   */
  async findByProjectId(projectId, status = null) {
    throw new Error('Method not implemented: findByProjectId');
  }

  /**
   * Find applications by applicant ID
   * @param {string} applicantId - Applicant's user ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Application[]>}
   */
  async findByApplicantId(applicantId, status = null) {
    throw new Error('Method not implemented: findByApplicantId');
  }

  /**
   * Find applications for projects owned by a user
   * @param {string} ownerId - Project owner's user ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Application[]>}
   */
  async findByProjectOwnerId(ownerId, status = null) {
    throw new Error('Method not implemented: findByProjectOwnerId');
  }

  /**
   * Check if an application already exists
   * @param {string} applicantId - Applicant's user ID
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>}
   */
  async exists(applicantId, projectId) {
    throw new Error('Method not implemented: exists');
  }

  /**
   * Save an application (create or update)
   * @param {Application} application - Application entity to save
   * @returns {Promise<Application>}
   */
  async save(application) {
    throw new Error('Method not implemented: save');
  }

  /**
   * Create a new application
   * @param {Application} application - Application entity to create
   * @returns {Promise<Application>}
   */
  async create(application) {
    throw new Error('Method not implemented: create');
  }

  /**
   * Update an existing application
   * @param {string} id - Application ID
   * @param {object} data - Data to update
   * @returns {Promise<Application>}
   */
  async update(id, data) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Update application status
   * @param {string} id - Application ID
   * @param {string} status - New status
   * @param {string} reviewerId - ID of user reviewing
   * @param {string} reason - Optional reason (for rejection)
   * @returns {Promise<Application>}
   */
  async updateStatus(id, status, reviewerId, reason = null) {
    throw new Error('Method not implemented: updateStatus');
  }

  /**
   * Delete an application by ID
   * @param {string} id - Application ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Delete all applications for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<number>} - Number of deleted applications
   */
  async deleteByProjectId(projectId) {
    throw new Error('Method not implemented: deleteByProjectId');
  }

  /**
   * Count applications by status for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<{ pending: number, accepted: number, rejected: number, withdrawn: number }>}
   */
  async countByStatusForProject(projectId) {
    throw new Error('Method not implemented: countByStatusForProject');
  }

  /**
   * Get recent applications for a project
   * @param {string} projectId - Project ID
   * @param {number} limit - Number of applications to retrieve
   * @returns {Promise<Application[]>}
   */
  async getRecentForProject(projectId, limit = 10) {
    throw new Error('Method not implemented: getRecentForProject');
  }
}

export default IApplicationRepository;
