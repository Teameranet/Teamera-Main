/**
 * In-Memory Application Repository - Infrastructure Layer
 * Implementation of IApplicationRepository using in-memory storage
 *
 * Clean Architecture: Infrastructure Layer
 * - Implements the repository interface defined in Domain Layer
 * - Contains the actual data persistence logic
 * - Can be easily swapped with other implementations (MongoDB, PostgreSQL, etc.)
 */

import { Application, ApplicationStatus } from '../../domain/entities/Application.js';

class InMemoryApplicationRepository {
  constructor() {
    this.applications = new Map();
  }

  /**
   * Generate unique ID
   * @returns {string}
   */
  generateId() {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Find an application by its ID
   * @param {string} id - Application ID
   * @returns {Promise<Application|null>}
   */
  async findById(id) {
    const data = this.applications.get(id);
    return data ? Application.fromJSON(data) : null;
  }

  /**
   * Find all applications with optional filters
   * @param {object} filters - Optional filtering criteria
   * @param {object} options - Pagination and sorting options
   * @returns {Promise<{ data: Application[], total: number, page: number, limit: number }>}
   */
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'appliedDate', sortOrder = 'desc' } = options;

    let results = Array.from(this.applications.values());

    // Apply filters
    if (filters.status) {
      results = results.filter((app) => app.status === filters.status);
    }
    if (filters.projectId) {
      results = results.filter((app) => app.projectId === filters.projectId);
    }
    if (filters.applicantId) {
      results = results.filter((app) => app.applicantId === filters.applicantId);
    }

    // Sort results
    results.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Paginate
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      data: paginatedResults.map((app) => Application.fromJSON(app)),
      total,
      page,
      limit,
    };
  }

  /**
   * Find applications by project ID
   * @param {string} projectId - Project ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Application[]>}
   */
  async findByProjectId(projectId, status = null) {
    let results = Array.from(this.applications.values()).filter(
      (app) => app.projectId === projectId
    );

    if (status) {
      results = results.filter((app) => app.status === status);
    }

    // Sort by applied date (newest first)
    results.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    return results.map((app) => Application.fromJSON(app));
  }

  /**
   * Find applications by applicant ID
   * @param {string} applicantId - Applicant's user ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Application[]>}
   */
  async findByApplicantId(applicantId, status = null) {
    let results = Array.from(this.applications.values()).filter(
      (app) => app.applicantId === applicantId
    );

    if (status) {
      results = results.filter((app) => app.status === status);
    }

    // Sort by applied date (newest first)
    results.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    return results.map((app) => Application.fromJSON(app));
  }

  /**
   * Find applications for projects owned by a user
   * This requires knowing which projects the user owns
   * @param {string} ownerId - Project owner's user ID
   * @param {string} status - Optional status filter
   * @param {string[]} ownedProjectIds - Optional list of project IDs owned by user
   * @returns {Promise<Application[]>}
   */
  async findByProjectOwnerId(ownerId, status = null, ownedProjectIds = []) {
    // If no project IDs provided, we need to be given them externally
    // In a real implementation, we'd join with projects table
    let results = Array.from(this.applications.values());

    if (ownedProjectIds.length > 0) {
      results = results.filter((app) => ownedProjectIds.includes(app.projectId));
    }

    if (status) {
      results = results.filter((app) => app.status === status);
    }

    // Sort by applied date (newest first)
    results.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    return results.map((app) => Application.fromJSON(app));
  }

  /**
   * Check if an application already exists
   * @param {string} applicantId - Applicant's user ID
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>}
   */
  async exists(applicantId, projectId) {
    const applications = Array.from(this.applications.values());
    return applications.some(
      (app) =>
        app.applicantId === applicantId &&
        app.projectId === projectId &&
        app.status !== ApplicationStatus.WITHDRAWN
    );
  }

  /**
   * Check if an application exists by ID
   * @param {string} id - Application ID
   * @returns {Promise<boolean>}
   */
  async existsById(id) {
    return this.applications.has(id);
  }

  /**
   * Save an application (create or update)
   * @param {Application} application - Application entity to save
   * @returns {Promise<Application>}
   */
  async save(application) {
    const data = application.toJSON();
    if (!data.id) {
      data.id = this.generateId();
    }
    this.applications.set(data.id, data);
    return Application.fromJSON(data);
  }

  /**
   * Create a new application
   * @param {Application} application - Application entity to create
   * @returns {Promise<Application>}
   */
  async create(application) {
    const data = application.toJSON();
    if (!data.id) {
      data.id = this.generateId();
    }
    this.applications.set(data.id, data);
    return Application.fromJSON(data);
  }

  /**
   * Update an existing application
   * @param {string} id - Application ID
   * @param {object} data - Data to update
   * @returns {Promise<Application>}
   */
  async update(id, data) {
    const existing = this.applications.get(id);
    if (!existing) {
      throw new Error('Application not found');
    }

    const updated = { ...existing, ...data, id };
    this.applications.set(id, updated);
    return Application.fromJSON(updated);
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
    const existing = this.applications.get(id);
    if (!existing) {
      throw new Error('Application not found');
    }

    const updated = {
      ...existing,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
    };

    if (reason) {
      updated.rejectionReason = reason;
    }

    this.applications.set(id, updated);
    return Application.fromJSON(updated);
  }

  /**
   * Delete an application by ID
   * @param {string} id - Application ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!this.applications.has(id)) {
      return false;
    }
    this.applications.delete(id);
    return true;
  }

  /**
   * Delete all applications for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<number>} - Number of deleted applications
   */
  async deleteByProjectId(projectId) {
    let deletedCount = 0;
    const idsToDelete = [];

    for (const [id, app] of this.applications.entries()) {
      if (app.projectId === projectId) {
        idsToDelete.push(id);
      }
    }

    for (const id of idsToDelete) {
      this.applications.delete(id);
      deletedCount++;
    }

    return deletedCount;
  }

  /**
   * Count applications by status for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<{ pending: number, accepted: number, rejected: number, withdrawn: number }>}
   */
  async countByStatusForProject(projectId) {
    const applications = Array.from(this.applications.values()).filter(
      (app) => app.projectId === projectId
    );

    return {
      pending: applications.filter((app) => app.status === ApplicationStatus.PENDING).length,
      accepted: applications.filter((app) => app.status === ApplicationStatus.ACCEPTED).length,
      rejected: applications.filter((app) => app.status === ApplicationStatus.REJECTED).length,
      withdrawn: applications.filter((app) => app.status === ApplicationStatus.WITHDRAWN).length,
    };
  }

  /**
   * Get recent applications for a project
   * @param {string} projectId - Project ID
   * @param {number} limit - Number of applications to retrieve
   * @returns {Promise<Application[]>}
   */
  async getRecentForProject(projectId, limit = 10) {
    const applications = Array.from(this.applications.values())
      .filter((app) => app.projectId === projectId)
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, limit);

    return applications.map((app) => Application.fromJSON(app));
  }

  /**
   * Count total applications
   * @returns {Promise<number>}
   */
  async count() {
    return this.applications.size;
  }

  /**
   * Clear all applications (for testing)
   * @returns {Promise<void>}
   */
  async clear() {
    this.applications.clear();
  }

  /**
   * Seed with initial data (for testing/demo)
   * @param {object[]} applications - Array of application data
   * @returns {Promise<void>}
   */
  async seed(applications) {
    for (const app of applications) {
      const data = { ...app };
      if (!data.id) {
        data.id = this.generateId();
      }
      this.applications.set(data.id, data);
    }
  }
}

// Create singleton instance
const applicationRepository = new InMemoryApplicationRepository();

export { InMemoryApplicationRepository, applicationRepository };
export default applicationRepository;
