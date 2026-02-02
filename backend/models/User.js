// User Model - Defines user structure and validation

class User {
  constructor(data) {
    this.id = data.id || User.generateId();
    this.name = data.name || '';
    this.email = data.email || '';
    this.avatar = data.avatar || null;
    this.bio = data.bio || '';
    this.role = data.role || 'user';
    this.status = data.status || 'active';
    this.skills = data.skills || [];
    this.socialLinks = data.socialLinks || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Generate a unique ID
   */
  static generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate user data
   * @param {object} data - User data to validate
   * @returns {object} - { isValid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required');
    } else if (data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (data.name.trim().length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    // Email validation
    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    // Bio validation (optional)
    if (data.bio && typeof data.bio === 'string' && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    // Role validation (optional)
    if (data.role) {
      const validRoles = ['user', 'admin', 'moderator'];
      if (!validRoles.includes(data.role)) {
        errors.push('Invalid role specified');
      }
    }

    // Status validation (optional)
    if (data.status) {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(data.status)) {
        errors.push('Invalid status specified');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new User instance
   * @param {object} data - User data
   * @returns {User} - New User instance
   */
  static create(data) {
    return new User({
      name: data.name?.trim(),
      email: data.email?.toLowerCase().trim(),
      avatar: data.avatar || null,
      bio: data.bio?.trim() || '',
      role: data.role || 'user',
      status: 'active',
      skills: data.skills || [],
      socialLinks: data.socialLinks || {}
    });
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

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Convert to JSON (excludes sensitive data)
   * @returns {object} - User data as plain object
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Get public profile (limited data)
   * @returns {object} - Public user data
   */
  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      bio: this.bio,
      skills: this.skills,
      socialLinks: this.socialLinks
    };
  }
}

export default User;
