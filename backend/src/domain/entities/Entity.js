/**
 * Base Entity class for the Domain Layer
 * All domain entities should extend this class
 *
 * Clean Architecture: Domain Layer
 * - Contains core business logic
 * - No dependencies on external frameworks
 * - Pure JavaScript/Node.js
 */

class Entity {
  constructor(id) {
    this._id = id || Entity.generateId();
    this._createdAt = new Date().toISOString();
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Get entity ID
   * @returns {string}
   */
  get id() {
    return this._id;
  }

  /**
   * Get creation timestamp
   * @returns {string}
   */
  get createdAt() {
    return this._createdAt;
  }

  /**
   * Get last update timestamp
   * @returns {string}
   */
  get updatedAt() {
    return this._updatedAt;
  }

  /**
   * Set creation timestamp (for hydrating from database)
   * @param {string} timestamp
   */
  set createdAt(timestamp) {
    this._createdAt = timestamp;
  }

  /**
   * Set update timestamp
   * @param {string} timestamp
   */
  set updatedAt(timestamp) {
    this._updatedAt = timestamp;
  }

  /**
   * Mark entity as updated
   */
  markAsUpdated() {
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Generate a unique ID
   * @returns {string}
   */
  static generateId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `${timestamp}-${randomPart}`;
  }

  /**
   * Check equality by ID
   * @param {Entity} entity
   * @returns {boolean}
   */
  equals(entity) {
    if (!(entity instanceof Entity)) {
      return false;
    }
    return this._id === entity._id;
  }

  /**
   * Convert entity to plain object
   * Override in child classes to customize
   * @returns {object}
   */
  toJSON() {
    return {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  /**
   * Create entity from plain object
   * Override in child classes
   * @param {object} data
   * @returns {Entity}
   */
  static fromJSON(data) {
    const entity = new Entity(data.id);
    if (data.createdAt) entity._createdAt = data.createdAt;
    if (data.updatedAt) entity._updatedAt = data.updatedAt;
    return entity;
  }

  /**
   * Clone the entity
   * @returns {Entity}
   */
  clone() {
    return this.constructor.fromJSON(this.toJSON());
  }

  /**
   * Validate entity data
   * Override in child classes to add specific validation
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validate() {
    const errors = [];

    if (!this._id || typeof this._id !== 'string') {
      errors.push('Entity must have a valid ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default Entity;
