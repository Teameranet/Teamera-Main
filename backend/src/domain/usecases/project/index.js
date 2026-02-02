/**
 * Project Use Cases - Domain Layer
 * Application-specific business rules for Project operations
 *
 * Clean Architecture: Use Cases orchestrate the flow of data
 * to and from entities, and direct entities to use their
 * enterprise-wide business rules to achieve the goals of the use case.
 */

/**
 * CreateProjectUseCase - Create a new project
 */
export class CreateProjectUseCase {
  constructor(projectRepository, userRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  async execute({ title, description, stage, industry, requiredSkills, openPositions, funding, ownerId }) {
    // Validate owner exists
    const owner = await this.userRepository.findById(ownerId);
    if (!owner) {
      throw new Error('Owner not found');
    }

    // Check for duplicate title by same owner
    const existingProject = await this.projectRepository.existsByTitleAndOwner(title, ownerId);
    if (existingProject) {
      throw new Error('You already have a project with this title');
    }

    // Import Project entity dynamically to avoid circular dependencies
    const { Project } = await import('../../entities/Project.js');

    // Validate project data
    const validation = Project.validate({
      title,
      description,
      stage,
      industry,
      requiredSkills,
      openPositions,
      ownerId,
    });

    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.name = 'ValidationError';
      error.errors = validation.errors;
      throw error;
    }

    // Create project entity
    const project = Project.create({
      title,
      description,
      stage,
      industry,
      requiredSkills,
      openPositions,
      funding,
      ownerId,
      teamMembers: [
        {
          id: owner.id,
          name: owner.name,
          role: 'Founder',
          avatar: owner.avatar,
          email: owner.email,
        },
      ],
    });

    // Persist project
    const savedProject = await this.projectRepository.save(project);
    return savedProject;
  }
}

/**
 * GetProjectUseCase - Get a project by ID
 */
export class GetProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }
    return project;
  }
}

/**
 * GetAllProjectsUseCase - Get all projects with filtering and pagination
 */
export class GetAllProjectsUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const result = await this.projectRepository.findAll(filters, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return result;
  }
}

/**
 * GetUserProjectsUseCase - Get all projects for a specific user
 */
export class GetUserProjectsUseCase {
  constructor(projectRepository, userRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  async execute(userId) {
    // Verify user exists
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Get projects owned by user
    const ownedProjects = await this.projectRepository.findByOwnerId(userId);

    // Get projects where user is a team member
    const participatingProjects = await this.projectRepository.findByTeamMemberId(userId);

    // Filter out owned projects from participating (user might be both owner and in team)
    const uniqueParticipating = participatingProjects.filter(
      (project) => project.ownerId !== userId
    );

    return {
      ownedProjects,
      participatingProjects: uniqueParticipating,
    };
  }
}

/**
 * UpdateProjectUseCase - Update an existing project
 */
export class UpdateProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId, updateData, requesterId) {
    // Get existing project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check authorization - only owner can update
    if (project.ownerId !== requesterId) {
      const error = new Error('Not authorized to update this project');
      error.name = 'AuthorizationError';
      throw error;
    }

    // Update project
    project.update(updateData);

    // Persist changes
    const updatedProject = await this.projectRepository.update(project);
    return updatedProject;
  }
}

/**
 * DeleteProjectUseCase - Delete a project
 */
export class DeleteProjectUseCase {
  constructor(projectRepository, applicationRepository) {
    this.projectRepository = projectRepository;
    this.applicationRepository = applicationRepository;
  }

  async execute(projectId, requesterId) {
    // Get existing project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check authorization - only owner can delete
    if (project.ownerId !== requesterId) {
      const error = new Error('Not authorized to delete this project');
      error.name = 'AuthorizationError';
      throw error;
    }

    // Delete all associated applications
    if (this.applicationRepository) {
      await this.applicationRepository.deleteByProjectId(projectId);
    }

    // Delete project
    const deleted = await this.projectRepository.delete(projectId);
    return deleted;
  }
}

/**
 * SearchProjectsUseCase - Search projects by query
 */
export class SearchProjectsUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(query, filters = {}) {
    if (!query || query.trim().length < 2) {
      const error = new Error('Search query must be at least 2 characters');
      error.name = 'ValidationError';
      throw error;
    }

    const projects = await this.projectRepository.search(query.trim(), filters);
    return projects;
  }
}

/**
 * UpdateProjectStageUseCase - Update project stage/progress
 */
export class UpdateProjectStageUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId, newStage, requesterId) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check authorization
    if (project.ownerId !== requesterId) {
      const error = new Error('Not authorized to update project stage');
      error.name = 'AuthorizationError';
      throw error;
    }

    // Update stage (entity will validate)
    project.updateStage(newStage);

    // Persist changes
    const updatedProject = await this.projectRepository.update(project);
    return updatedProject;
  }
}

/**
 * AddTeamMemberUseCase - Add a new member to project team
 */
export class AddTeamMemberUseCase {
  constructor(projectRepository, userRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  async execute(projectId, memberId, role, requesterId) {
    // Get project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check authorization - only owner can add members
    if (project.ownerId !== requesterId) {
      const error = new Error('Not authorized to add team members');
      error.name = 'AuthorizationError';
      throw error;
    }

    // Get member details
    const member = await this.userRepository.findById(memberId);
    if (!member) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Add member to project
    project.addTeamMember({
      id: member.id,
      name: member.name,
      role: role,
      avatar: member.avatar,
      email: member.email,
    });

    // Persist changes
    const updatedProject = await this.projectRepository.update(project);
    return updatedProject;
  }
}

/**
 * RemoveTeamMemberUseCase - Remove a member from project team
 */
export class RemoveTeamMemberUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId, memberId, requesterId) {
    // Get project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check authorization - owner or the member themselves can remove
    const isOwner = project.ownerId === requesterId;
    const isSelf = memberId === requesterId;

    if (!isOwner && !isSelf) {
      const error = new Error('Not authorized to remove this team member');
      error.name = 'AuthorizationError';
      throw error;
    }

    // Cannot remove owner
    if (memberId === project.ownerId) {
      const error = new Error('Cannot remove the project owner');
      error.name = 'ValidationError';
      throw error;
    }

    // Remove member from project
    project.removeTeamMember(memberId);

    // Persist changes
    const updatedProject = await this.projectRepository.update(project);
    return updatedProject;
  }
}

/**
 * GetFeaturedProjectsUseCase - Get featured/popular projects
 */
export class GetFeaturedProjectsUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(limit = 6) {
    const projects = await this.projectRepository.findFeatured(limit);
    return projects;
  }
}

/**
 * GetRecentProjectsUseCase - Get recently created projects
 */
export class GetRecentProjectsUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(limit = 10) {
    const projects = await this.projectRepository.findRecent(limit);
    return projects;
  }
}

// Export all use cases
export default {
  CreateProjectUseCase,
  GetProjectUseCase,
  GetAllProjectsUseCase,
  GetUserProjectsUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
  SearchProjectsUseCase,
  UpdateProjectStageUseCase,
  AddTeamMemberUseCase,
  RemoveTeamMemberUseCase,
  GetFeaturedProjectsUseCase,
  GetRecentProjectsUseCase,
};
