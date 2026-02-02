/**
 * User Use Cases - Domain Layer
 * Application Business Rules for User operations
 *
 * Clean Architecture: Use Cases contain application-specific business rules
 * They orchestrate the flow of data to and from entities and direct those
 * entities to use their enterprise-wide business rules to achieve the goals
 * of the use case.
 */

import { User } from '../../entities/User.js';

/**
 * Get All Users Use Case
 */
export class GetAllUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {object} options - Query options (pagination, filters, etc.)
   * @returns {Promise<{ users: User[], total: number, page: number, totalPages: number }>}
   */
  async execute(options = {}) {
    const { page = 1, limit = 10, status, role, sortBy, sortOrder } = options;

    const filters = {};
    if (status) filters.status = status;
    if (role) filters.role = role;

    const result = await this.userRepository.findAll({
      filters,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return {
      users: result.users.map((user) => user.toJSON()),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }
}

/**
 * Get User By ID Use Case
 */
export class GetUserByIdUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {string} id - User ID
   * @returns {Promise<User>}
   * @throws {Error} If user not found
   */
  async execute(id) {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return user.toJSON();
  }
}

/**
 * Get User By Email Use Case
 */
export class GetUserByEmailUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  async execute(email) {
    if (!email) {
      throw new Error('Email is required');
    }

    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());

    return user ? user.toJSON() : null;
  }
}

/**
 * Create User Use Case
 */
export class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {object} userData - User data
   * @returns {Promise<User>}
   * @throws {Error} If validation fails or email exists
   */
  async execute(userData) {
    // Check for required fields
    if (!userData.name || !userData.email) {
      const error = new Error('Name and email are required');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(
      userData.email.toLowerCase().trim()
    );

    if (existingUser) {
      const error = new Error('Email already exists');
      error.code = 'EMAIL_EXISTS';
      error.status = 409;
      throw error;
    }

    // Create user entity (validates data)
    const user = User.create({
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      bio: userData.bio,
      role: userData.role || 'user',
      skills: userData.skills || [],
      socialLinks: userData.socialLinks || {},
    });

    // Persist user
    const createdUser = await this.userRepository.create(user);

    return createdUser.toJSON();
  }
}

/**
 * Update User Use Case
 */
export class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {string} id - User ID
   * @param {object} userData - Updated user data
   * @returns {Promise<User>}
   * @throws {Error} If user not found or validation fails
   */
  async execute(id, userData) {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Get existing user
    const user = await this.userRepository.findById(id);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Check if email is being changed and if new email exists
    if (userData.email && userData.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await this.userRepository.emailExists(
        userData.email.toLowerCase().trim(),
        id
      );

      if (emailExists) {
        const error = new Error('Email already exists');
        error.code = 'EMAIL_EXISTS';
        error.status = 409;
        throw error;
      }
    }

    // Update user entity (validates data)
    user.update(userData);

    // Persist changes
    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toJSON();
  }
}

/**
 * Update User Profile Use Case
 * Similar to UpdateUser but focused on profile-specific fields
 */
export class UpdateUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {string} id - User ID
   * @param {object} profileData - Profile data to update
   * @returns {Promise<User>}
   */
  async execute(id, profileData) {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Only update allowed profile fields
    const allowedFields = ['avatar', 'bio', 'skills', 'socialLinks'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updates[field] = profileData[field];
      }
    });

    user.update(updates);

    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toJSON();
  }
}

/**
 * Delete User Use Case
 */
export class DeleteUserUseCase {
  constructor(userRepository, projectRepository = null) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
  }

  /**
   * Execute the use case
   * @param {string} id - User ID
   * @returns {Promise<{ success: boolean, deletedUser: object }>}
   * @throws {Error} If user not found
   */
  async execute(id) {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Optionally check if user owns projects
    if (this.projectRepository) {
      const ownedProjects = await this.projectRepository.findByOwnerId(id);
      if (ownedProjects && ownedProjects.length > 0) {
        const error = new Error(
          'Cannot delete user with owned projects. Transfer or delete projects first.'
        );
        error.code = 'HAS_OWNED_PROJECTS';
        error.status = 400;
        throw error;
      }
    }

    const deletedUser = user.toJSON();
    await this.userRepository.delete(id);

    return {
      success: true,
      deletedUser,
    };
  }
}

/**
 * Get User Projects Use Case
 */
export class GetUserProjectsUseCase {
  constructor(userRepository, projectRepository) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
  }

  /**
   * Execute the use case
   * @param {string} userId - User ID
   * @returns {Promise<{ ownedProjects: Project[], participatingProjects: Project[] }>}
   */
  async execute(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Get owned projects
    const ownedProjects = await this.projectRepository.findByOwnerId(userId);

    // Get participating projects (as team member, but not owner)
    const participatingProjects = await this.projectRepository.findByTeamMemberId(userId);

    return {
      ownedProjects: ownedProjects.map((p) => p.toJSON()),
      participatingProjects: participatingProjects
        .filter((p) => p.ownerId !== userId)
        .map((p) => p.toJSON()),
    };
  }
}

/**
 * Search Users Use Case
 */
export class SearchUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<{ users: User[], total: number }>}
   */
  async execute(query, options = {}) {
    if (!query || query.trim().length < 2) {
      const error = new Error('Search query must be at least 2 characters');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const result = await this.userRepository.search(query.trim(), options);

    return {
      users: result.users.map((user) => user.toPublicProfile()),
      total: result.total,
    };
  }
}

/**
 * Find Users By Skills Use Case
 */
export class FindUsersBySkillsUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {string[]} skills - Array of skills to match
   * @param {boolean} matchAll - Whether to match all skills or any
   * @returns {Promise<User[]>}
   */
  async execute(skills, matchAll = false) {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      const error = new Error('At least one skill is required');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const users = await this.userRepository.findBySkills(skills, matchAll);

    return users.map((user) => user.toPublicProfile());
  }
}

// Export all use cases
export default {
  GetAllUsersUseCase,
  GetUserByIdUseCase,
  GetUserByEmailUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  UpdateUserProfileUseCase,
  DeleteUserUseCase,
  GetUserProjectsUseCase,
  SearchUsersUseCase,
  FindUsersBySkillsUseCase,
};
