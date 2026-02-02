/**
 * Project Repository Interface - Domain Layer
 * Defines the contract for project data access
 *
 * Clean Architecture: This interface belongs to the domain layer
 * and should not contain any implementation details or framework dependencies.
 * Concrete implementations will be in the infrastructure layer.
 */

/**
 * @interface IProjectRepository
 * @description Abstract interface for project data operations
 */
class IProjectRepository {
  /**
   * Find a project by its ID
   * @param {string} id - Project ID
   * @returns {Promise<Project|null>} - Project entity or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Find all projects with optional filtering
   * @param {object} filters - Optional filter criteria
   * @param {string} filters.stage - Filter by project stage
   * @param {string} filters.industry - Filter by industry
   * @param {string} filters.ownerId - Filter by owner ID
   * @param {object} options - Optional query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort direction ('asc' or 'desc')
   * @returns {Promise<{ data: Project[], pagination: object }>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Find projects by owner ID
   * @param {string} ownerId - Owner's user ID
   * @returns {Promise<Project[]>} - Array of projects owned by the user
   */
  async findByOwnerId(ownerId) {
    throw new Error('Method not implemented: findByOwnerId');
  }

  /**
   * Find projects where user is a team member
   * @param {string} userId - User ID
   * @returns {Promise<Project[]>} - Array of projects user participates in
   */
  async findByTeamMemberId(userId) {
    throw new Error('Method not implemented: findByTeamMemberId');
  }

  /**
   * Find projects by industry
   * @param {string} industry - Industry name
   * @returns {Promise<Project[]>} - Array of projects in the industry
   */
  async findByIndustry(industry) {
    throw new Error('Method not implemented: findByIndustry');
  }

  /**
   * Find projects by stage
   * @param {string} stage - Project stage
   * @returns {Promise<Project[]>} - Array of projects in the stage
   */
  async findByStage(stage) {
    throw new Error('Method not implemented: findByStage');
  }

  /**
   * Find projects matching required skills
   * @param {string[]} skills - Array of skill names
   * @returns {Promise<Project[]>} - Array of matching projects
   */
  async findBySkills(skills) {
    throw new Error('Method not implemented: findBySkills');
  }

  /**
   * Search projects by title or description
   * @param {string} query - Search query
   * @returns {Promise<Project[]>} - Array of matching projects
   */
  async search(query) {
    throw new Error('Method not implemented: search');
  }

  /**
   * Save a new project
   * @param {Project} project - Project entity to save
   * @returns {Promise<Project>} - Saved project with generated ID
   */
  async save(project) {
    throw new Error('Method not implemented: save');
  }

  /**
   * Update an existing project
   * @param {Project} project - Project entity with updates
   * @returns {Promise<Project>} - Updated project
   */
  async update(project) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Delete a project by ID
   * @param {string} id - Project ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }

  /**
   * Check if a project exists by ID
   * @param {string} id - Project ID
   * @returns {Promise<boolean>} - True if exists
   */
  async exists(id) {
    throw new Error('Method not implemented: exists');
  }

  /**
   * Check if a project with the same title exists for an owner
   * @param {string} title - Project title
   * @param {string} ownerId - Owner ID
   * @param {string} excludeId - Optional project ID to exclude from check
   * @returns {Promise<boolean>} - True if exists
   */
  async existsByTitleAndOwner(title, ownerId, excludeId = null) {
    throw new Error('Method not implemented: existsByTitleAndOwner');
  }

  /**
   * Add a team member to a project
   * @param {string} projectId - Project ID
   * @param {object} member - Team member data
   * @returns {Promise<Project>} - Updated project
   */
  async addTeamMember(projectId, member) {
    throw new Error('Method not implemented: addTeamMember');
  }

  /**
   * Remove a team member from a project
   * @param {string} projectId - Project ID
   * @param {string} memberId - Member's user ID
   * @returns {Promise<Project>} - Updated project
   */
  async removeTeamMember(projectId, memberId) {
    throw new Error('Method not implemented: removeTeamMember');
  }

  /**
   * Update project stage
   * @param {string} projectId - Project ID
   * @param {string} stage - New stage
   * @returns {Promise<Project>} - Updated project
   */
  async updateStage(projectId, stage) {
    throw new Error('Method not implemented: updateStage');
  }

  /**
   * Increment the application count for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Project>} - Updated project
   */
  async incrementApplicationCount(projectId) {
    throw new Error('Method not implemented: incrementApplicationCount');
  }

  /**
   * Get project count with optional filters
   * @param {object} filters - Optional filter criteria
   * @returns {Promise<number>} - Count of projects
   */
  async count(filters = {}) {
    throw new Error('Method not implemented: count');
  }

  /**
   * Get recent projects
   * @param {number} limit - Maximum number of projects to return
   * @returns {Promise<Project[]>} - Array of recent projects
   */
  async findRecent(limit = 10) {
    throw new Error('Method not implemented: findRecent');
  }

  /**
   * Get featured/popular projects
   * @param {number} limit - Maximum number of projects to return
   * @returns {Promise<Project[]>} - Array of featured projects
   */
  async findFeatured(limit = 10) {
    throw new Error('Method not implemented: findFeatured');
  }
}

export default IProjectRepository;
