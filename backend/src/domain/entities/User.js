/**
 * User Entity - Domain Layer
 * Contains core business logic and rules for User
 * This entity is framework-agnostic and represents the business domain
 */

export class User {
  constructor({
    id,
    name,
    email,
    password = null,
    avatar = null,
    bio = '',
    role = 'user',
    status = 'active',
    skills = [],
    socialLinks = {},
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.avatar = avatar;
    this.bio = bio;
    this.role = role;
    this.status = status;
    this.skills = skills;
    this.socialLinks = socialLinks;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

    // Validate on construction
    this.validate();
  }

  /**
   * Validate the user entity
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
    } else if (!User.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (this.bio && this.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    if (!User.VALID_ROLES.includes(this.role)) {
      errors.push(`Invalid role. Must be one of: ${User.VALID_ROLES.join(', ')}`);
    }

    if (!User.VALID_STATUSES.includes(this.status)) {
      errors.push(`Invalid status. Must be one of: ${User.VALID_STATUSES.join(', ')}`);
    }

    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.name = 'ValidationError';
      error.errors = errors;
      throw error;
    }
  }

  /**
   * Valid roles for users
   */
  static VALID_ROLES = ['user', 'admin', 'moderator'];

  /**
   * Valid statuses for users
   */
  static VALID_STATUSES = ['active', 'inactive', 'suspended'];

  /**
   * Check if an email is valid
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Update user properties
   * @param {object} data - Data to update
   * @returns {User} - Updated user instance
   */
  update(data) {
    if (data.name !== undefined) {
      this.name = data.name.trim();
    }
    if (data.email !== undefined) {
      this.email = data.email.toLowerCase().trim();
    }
    if (data.avatar !== undefined) {
      this.avatar = data.avatar;
    }
    if (data.bio !== undefined) {
      this.bio = data.bio.trim();
    }
    if (data.role !== undefined) {
      this.role = data.role;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
    if (data.skills !== undefined) {
      this.skills = data.skills;
    }
    if (data.socialLinks !== undefined) {
      this.socialLinks = { ...this.socialLinks, ...data.socialLinks };
    }

    this.updatedAt = new Date();

    // Validate after update
    this.validate();

    return this;
  }

  /**
   * Check if user is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Check if user is moderator or higher
   * @returns {boolean}
   */
  isModerator() {
    return this.role === 'admin' || this.role === 'moderator';
  }

  /**
   * Add a skill to user
   * @param {string} skill
   */
  addSkill(skill) {
    if (!this.skills.includes(skill)) {
      this.skills.push(skill);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove a skill from user
   * @param {string} skill
   */
  removeSkill(skill) {
    const index = this.skills.indexOf(skill);
    if (index > -1) {
      this.skills.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Convert to plain object (excludes sensitive data)
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      bio: this.bio,
      role: this.role,
      status: this.status,
      skills: this.skills,
      socialLinks: this.socialLinks,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Get public profile (limited data for other users to see)
   * @returns {object}
   */
  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      bio: this.bio,
      skills: this.skills,
      socialLinks: this.socialLinks,
    };
  }

  /**
   * Create a User instance from raw data
   * @param {object} data
   * @returns {User}
   */
  static create(data) {
    return new User({
      ...data,
      name: data.name?.trim(),
      email: data.email?.toLowerCase().trim(),
    });
  }

  /**
   * Reconstitute a User from database record
   * @param {object} record
   * @returns {User}
   */
  static fromPersistence(record) {
    return new User({
      id: record.id || record._id?.toString(),
      name: record.name,
      email: record.email,
      password: record.password,
      avatar: record.avatar,
      bio: record.bio,
      role: record.role,
      status: record.status,
      skills: record.skills || [],
      socialLinks: record.socialLinks || record.social_links || {},
      createdAt: record.createdAt || record.created_at,
      updatedAt: record.updatedAt || record.updated_at,
    });
  }
}

export default User;
