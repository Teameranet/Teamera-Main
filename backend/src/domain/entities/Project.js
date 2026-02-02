/**
 * Project Entity - Domain Layer
 * Contains core business logic and rules for Project
 */

export class Project {
  constructor({
    id,
    title,
    description,
    stage = 'idea',
    industry,
    requiredSkills = [],
    teamMembers = [],
    openPositions = [],
    funding = 'Not Funded',
    applications = 0,
    ownerId,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.stage = stage;
    this.industry = industry;
    this.requiredSkills = requiredSkills;
    this.teamMembers = teamMembers;
    this.openPositions = openPositions;
    this.funding = funding;
    this.applications = applications;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Valid project stages
  static STAGES = {
    IDEA: 'idea',
    PROTOTYPE: 'prototype',
    MVP: 'mvp',
    GROWTH: 'growth',
    SCALING: 'scaling',
  };

  // Valid funding statuses
  static FUNDING_STATUS = {
    NOT_FUNDED: 'Not Funded',
    BOOTSTRAPPED: 'Bootstrapped',
    SEED: 'Seed',
    SERIES_A: 'Series A',
    SERIES_B: 'Series B',
    SERIES_C: 'Series C+',
  };

  /**
   * Generate a unique project ID
   */
  static generateId() {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new Project instance
   */
  static create(data) {
    return new Project({
      id: Project.generateId(),
      title: data.title?.trim(),
      description: data.description?.trim(),
      stage: data.stage || Project.STAGES.IDEA,
      industry: data.industry,
      requiredSkills: data.requiredSkills || [],
      teamMembers: data.teamMembers || [],
      openPositions: data.openPositions || [],
      funding: data.funding || Project.FUNDING_STATUS.NOT_FUNDED,
      applications: 0,
      ownerId: data.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update project properties
   */
  update(data) {
    const updatableFields = [
      'title',
      'description',
      'stage',
      'industry',
      'requiredSkills',
      'openPositions',
      'funding',
    ];

    updatableFields.forEach((field) => {
      if (data[field] !== undefined) {
        this[field] = typeof data[field] === 'string'
          ? data[field].trim()
          : data[field];
      }
    });

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Add a team member to the project
   */
  addTeamMember(member) {
    const existingMember = this.teamMembers.find((m) => m.id === member.id);
    if (existingMember) {
      throw new Error('User is already a team member');
    }

    this.teamMembers.push({
      id: member.id,
      name: member.name,
      role: member.role,
      avatar: member.avatar || null,
      email: member.email,
      joinedAt: new Date().toISOString(),
    });

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Remove a team member from the project
   */
  removeTeamMember(memberId) {
    if (memberId === this.ownerId) {
      throw new Error('Cannot remove the project owner');
    }

    const memberIndex = this.teamMembers.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) {
      throw new Error('Team member not found');
    }

    this.teamMembers.splice(memberIndex, 1);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Update project stage
   */
  updateStage(newStage) {
    const validStages = Object.values(Project.STAGES);
    if (!validStages.includes(newStage)) {
      throw new Error(`Invalid stage. Must be one of: ${validStages.join(', ')}`);
    }

    this.stage = newStage;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Increment application count
   */
  incrementApplications() {
    this.applications += 1;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Check if a user is the owner
   */
  isOwner(userId) {
    return this.ownerId === userId;
  }

  /**
   * Check if a user is a team member
   */
  isTeamMember(userId) {
    return this.teamMembers.some((m) => m.id === userId);
  }

  /**
   * Check if a user has any role in the project
   */
  hasAccess(userId) {
    return this.isOwner(userId) || this.isTeamMember(userId);
  }

  /**
   * Validate project data
   */
  static validate(data) {
    const errors = [];

    // Title validation
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required');
    } else if (data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    } else if (data.title.trim().length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Description validation
    if (!data.description || typeof data.description !== 'string') {
      errors.push('Description is required');
    } else if (data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    } else if (data.description.trim().length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    // Stage validation
    if (data.stage) {
      const validStages = Object.values(Project.STAGES);
      if (!validStages.includes(data.stage)) {
        errors.push(`Invalid stage. Must be one of: ${validStages.join(', ')}`);
      }
    }

    // Industry validation
    if (!data.industry || typeof data.industry !== 'string') {
      errors.push('Industry is required');
    }

    // Owner validation
    if (!data.ownerId) {
      errors.push('Owner ID is required');
    }

    // Skills validation
    if (data.requiredSkills && !Array.isArray(data.requiredSkills)) {
      errors.push('Required skills must be an array');
    }

    // Open positions validation
    if (data.openPositions) {
      if (!Array.isArray(data.openPositions)) {
        errors.push('Open positions must be an array');
      } else {
        data.openPositions.forEach((position, index) => {
          if (!position.role) {
            errors.push(`Position ${index + 1}: Role is required`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      stage: this.stage,
      industry: this.industry,
      requiredSkills: this.requiredSkills,
      teamMembers: this.teamMembers,
      openPositions: this.openPositions,
      funding: this.funding,
      applications: this.applications,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Get project summary (minimal data)
   */
  toSummary() {
    return {
      id: this.id,
      title: this.title,
      stage: this.stage,
      industry: this.industry,
      teamSize: this.teamMembers.length,
      openPositions: this.openPositions.length,
      applications: this.applications,
    };
  }
}

export default Project;
