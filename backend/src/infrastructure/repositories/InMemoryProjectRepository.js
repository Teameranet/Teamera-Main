/**
 * In-Memory Project Repository - Infrastructure Layer
 * Implements IProjectRepository interface for development/testing
 *
 * Clean Architecture: Infrastructure Layer
 * - Implements repository interfaces defined in Domain layer
 * - Contains data access logic
 * - Can be swapped with database implementation without affecting business logic
 */

import { Project } from '../../domain/entities/Project.js';

class InMemoryProjectRepository {
  constructor() {
    // In-memory storage
    this.projects = new Map();

    // Initialize with some sample data
    this._initializeSampleData();
  }

  /**
   * Initialize with sample projects for development
   * @private
   */
  _initializeSampleData() {
    const sampleProjects = [
      {
        id: 'proj_1',
        title: 'AI-Powered Code Review Tool',
        description: 'Building an intelligent code review assistant that uses machine learning to provide actionable feedback on pull requests.',
        stage: 'mvp',
        industry: 'Developer Tools',
        requiredSkills: ['Python', 'Machine Learning', 'React', 'Node.js'],
        teamMembers: [
          { id: 'user_1', name: 'Alex Chen', role: 'Founder', avatar: null, email: 'alex@example.com' }
        ],
        openPositions: [
          { role: 'ML Engineer', skills: ['Python', 'TensorFlow'], isPaid: true },
          { role: 'Frontend Developer', skills: ['React', 'TypeScript'], isPaid: false }
        ],
        funding: 'Seed',
        applications: 5,
        ownerId: 'user_1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'proj_2',
        title: 'Sustainable Fashion Marketplace',
        description: 'A marketplace connecting eco-conscious consumers with sustainable fashion brands and second-hand clothing sellers.',
        stage: 'prototype',
        industry: 'E-commerce',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'UI/UX Design'],
        teamMembers: [
          { id: 'user_2', name: 'Sarah Miller', role: 'Founder', avatar: null, email: 'sarah@example.com' },
          { id: 'user_3', name: 'Jamie Wong', role: 'Designer', avatar: null, email: 'jamie@example.com' }
        ],
        openPositions: [
          { role: 'Backend Developer', skills: ['Node.js', 'PostgreSQL'], isPaid: true },
          { role: 'Marketing Lead', skills: ['Digital Marketing', 'SEO'], isPaid: false }
        ],
        funding: 'Bootstrapped',
        applications: 12,
        ownerId: 'user_2',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'proj_3',
        title: 'Mental Health Support App',
        description: 'A mobile app providing accessible mental health resources, mood tracking, and peer support communities.',
        stage: 'idea',
        industry: 'Healthcare',
        requiredSkills: ['React Native', 'Node.js', 'Psychology', 'UI/UX'],
        teamMembers: [
          { id: 'user_4', name: 'Dr. Emily Park', role: 'Founder', avatar: null, email: 'emily@example.com' }
        ],
        openPositions: [
          { role: 'Mobile Developer', skills: ['React Native', 'iOS', 'Android'], isPaid: false },
          { role: 'Backend Developer', skills: ['Node.js', 'MongoDB'], isPaid: false },
          { role: 'Clinical Advisor', skills: ['Psychology', 'Mental Health'], isPaid: false }
        ],
        funding: 'Not Funded',
        applications: 8,
        ownerId: 'user_4',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sampleProjects.forEach(data => {
      const project = new Project(data);
      this.projects.set(project.id, project);
    });
  }

  /**
   * Find a project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Project|null>}
   */
  async findById(id) {
    const project = this.projects.get(id);
    return project || null;
  }

  /**
   * Find all projects with optional filtering and pagination
   * @param {object} filters - Filter criteria
   * @param {object} options - Pagination and sorting options
   * @returns {Promise<{ data: Project[], pagination: object }>}
   */
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    let projects = Array.from(this.projects.values());

    // Apply filters
    if (filters.stage) {
      projects = projects.filter(p => p.stage === filters.stage);
    }
    if (filters.industry) {
      projects = projects.filter(p =>
        p.industry.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }
    if (filters.ownerId) {
      projects = projects.filter(p => p.ownerId === filters.ownerId);
    }
    if (filters.skills && filters.skills.length > 0) {
      projects = projects.filter(p =>
        filters.skills.some(skill =>
          p.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
        )
      );
    }

    // Sort
    projects.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Paginate
    const total = projects.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProjects = projects.slice(start, end);

    return {
      data: paginatedProjects,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Find projects by owner ID
   * @param {string} ownerId - Owner's user ID
   * @returns {Promise<Project[]>}
   */
  async findByOwnerId(ownerId) {
    return Array.from(this.projects.values()).filter(p => p.ownerId === ownerId);
  }

  /**
   * Find projects where user is a team member
   * @param {string} userId - User ID
   * @returns {Promise<Project[]>}
   */
  async findByTeamMemberId(userId) {
    return Array.from(this.projects.values()).filter(p =>
      p.teamMembers.some(member => member.id === userId)
    );
  }

  /**
   * Find projects by industry
   * @param {string} industry - Industry name
   * @returns {Promise<Project[]>}
   */
  async findByIndustry(industry) {
    return Array.from(this.projects.values()).filter(p =>
      p.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }

  /**
   * Find projects by stage
   * @param {string} stage - Project stage
   * @returns {Promise<Project[]>}
   */
  async findByStage(stage) {
    return Array.from(this.projects.values()).filter(p => p.stage === stage);
  }

  /**
   * Find projects by required skills
   * @param {string[]} skills - Array of skill names
   * @returns {Promise<Project[]>}
   */
  async findBySkills(skills) {
    const lowerSkills = skills.map(s => s.toLowerCase());
    return Array.from(this.projects.values()).filter(p =>
      p.requiredSkills.some(skill =>
        lowerSkills.includes(skill.toLowerCase())
      )
    );
  }

  /**
   * Search projects by title or description
   * @param {string} query - Search query
   * @returns {Promise<Project[]>}
   */
  async search(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.projects.values()).filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Save a new project
   * @param {Project} project - Project entity to save
   * @returns {Promise<Project>}
   */
  async save(project) {
    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Update an existing project
   * @param {Project} project - Project entity with updates
   * @returns {Promise<Project>}
   */
  async update(project) {
    if (!this.projects.has(project.id)) {
      throw new Error('Project not found');
    }
    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Delete a project by ID
   * @param {string} id - Project ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    return this.projects.delete(id);
  }

  /**
   * Check if a project exists by ID
   * @param {string} id - Project ID
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    return this.projects.has(id);
  }

  /**
   * Check if a project with same title exists for an owner
   * @param {string} title - Project title
   * @param {string} ownerId - Owner ID
   * @param {string} excludeId - Optional project ID to exclude
   * @returns {Promise<boolean>}
   */
  async existsByTitleAndOwner(title, ownerId, excludeId = null) {
    const lowerTitle = title.toLowerCase();
    return Array.from(this.projects.values()).some(p =>
      p.title.toLowerCase() === lowerTitle &&
      p.ownerId === ownerId &&
      p.id !== excludeId
    );
  }

  /**
   * Add a team member to a project
   * @param {string} projectId - Project ID
   * @param {object} member - Team member data
   * @returns {Promise<Project>}
   */
  async addTeamMember(projectId, member) {
    const project = await this.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.addTeamMember(member);
    return this.update(project);
  }

  /**
   * Remove a team member from a project
   * @param {string} projectId - Project ID
   * @param {string} memberId - Member's user ID
   * @returns {Promise<Project>}
   */
  async removeTeamMember(projectId, memberId) {
    const project = await this.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.removeTeamMember(memberId);
    return this.update(project);
  }

  /**
   * Update project stage
   * @param {string} projectId - Project ID
   * @param {string} stage - New stage
   * @returns {Promise<Project>}
   */
  async updateStage(projectId, stage) {
    const project = await this.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.updateStage(stage);
    return this.update(project);
  }

  /**
   * Increment the application count for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Project>}
   */
  async incrementApplicationCount(projectId) {
    const project = await this.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.incrementApplications();
    return this.update(project);
  }

  /**
   * Get project count with optional filters
   * @param {object} filters - Optional filter criteria
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    const result = await this.findAll(filters, { page: 1, limit: Number.MAX_SAFE_INTEGER });
    return result.pagination.total;
  }

  /**
   * Get recent projects
   * @param {number} limit - Maximum number of projects to return
   * @returns {Promise<Project[]>}
   */
  async findRecent(limit = 10) {
    const projects = Array.from(this.projects.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    return projects;
  }

  /**
   * Get featured/popular projects (by application count)
   * @param {number} limit - Maximum number of projects to return
   * @returns {Promise<Project[]>}
   */
  async findFeatured(limit = 10) {
    const projects = Array.from(this.projects.values())
      .sort((a, b) => b.applications - a.applications)
      .slice(0, limit);

    return projects;
  }

  /**
   * Clear all projects (useful for testing)
   */
  async clear() {
    this.projects.clear();
  }

  /**
   * Get all projects as array (for debugging)
   * @returns {Project[]}
   */
  toArray() {
    return Array.from(this.projects.values());
  }
}

// Export singleton instance for simple use cases
export const projectRepository = new InMemoryProjectRepository();

// Export class for dependency injection
export default InMemoryProjectRepository;
