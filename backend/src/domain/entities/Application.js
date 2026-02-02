/**
 * Application Entity - Domain Layer
 * Represents a project application in the system
 */

export class Application {
  constructor({
    id,
    applicantId,
    applicantName,
    applicantEmail,
    applicantAvatar = null,
    applicantColor = null,
    projectId,
    projectName,
    position,
    skills = [],
    message = '',
    status = ApplicationStatus.PENDING,
    hasResume = false,
    resumeUrl = null,
    userDetails = null,
    appliedDate = new Date().toISOString(),
    reviewedAt = null,
    reviewedBy = null,
    rejectionReason = null,
  }) {
    this.id = id;
    this.applicantId = applicantId;
    this.applicantName = applicantName;
    this.applicantEmail = applicantEmail;
    this.applicantAvatar = applicantAvatar;
    this.applicantColor = applicantColor;
    this.projectId = projectId;
    this.projectName = projectName;
    this.position = position;
    this.skills = skills;
    this.message = message;
    this.status = status;
    this.hasResume = hasResume;
    this.resumeUrl = resumeUrl;
    this.userDetails = userDetails;
    this.appliedDate = appliedDate;
    this.reviewedAt = reviewedAt;
    this.reviewedBy = reviewedBy;
    this.rejectionReason = rejectionReason;
  }

  /**
   * Check if application is pending
   */
  isPending() {
    return this.status === ApplicationStatus.PENDING;
  }

  /**
   * Check if application is accepted
   */
  isAccepted() {
    return this.status === ApplicationStatus.ACCEPTED;
  }

  /**
   * Check if application is rejected
   */
  isRejected() {
    return this.status === ApplicationStatus.REJECTED;
  }

  /**
   * Accept the application
   */
  accept(reviewerId) {
    if (!this.isPending()) {
      throw new Error('Can only accept pending applications');
    }
    this.status = ApplicationStatus.ACCEPTED;
    this.reviewedAt = new Date().toISOString();
    this.reviewedBy = reviewerId;
    return this;
  }

  /**
   * Reject the application
   */
  reject(reviewerId, reason = null) {
    if (!this.isPending()) {
      throw new Error('Can only reject pending applications');
    }
    this.status = ApplicationStatus.REJECTED;
    this.reviewedAt = new Date().toISOString();
    this.reviewedBy = reviewerId;
    this.rejectionReason = reason;
    return this;
  }

  /**
   * Withdraw the application
   */
  withdraw() {
    if (!this.isPending()) {
      throw new Error('Can only withdraw pending applications');
    }
    this.status = ApplicationStatus.WITHDRAWN;
    return this;
  }

  /**
   * Update user details
   */
  updateUserDetails(details) {
    this.userDetails = { ...this.userDetails, ...details };
    return this;
  }

  /**
   * Attach resume
   */
  attachResume(resumeUrl) {
    this.hasResume = true;
    this.resumeUrl = resumeUrl;
    return this;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      applicantId: this.applicantId,
      applicantName: this.applicantName,
      applicantEmail: this.applicantEmail,
      applicantAvatar: this.applicantAvatar,
      applicantColor: this.applicantColor,
      projectId: this.projectId,
      projectName: this.projectName,
      position: this.position,
      skills: this.skills,
      message: this.message,
      status: this.status,
      hasResume: this.hasResume,
      resumeUrl: this.resumeUrl,
      userDetails: this.userDetails,
      appliedDate: this.appliedDate,
      reviewedAt: this.reviewedAt,
      reviewedBy: this.reviewedBy,
      rejectionReason: this.rejectionReason,
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(data) {
    return new Application(data);
  }

  /**
   * Validate application data
   */
  static validate(data) {
    const errors = [];

    if (!data.applicantId) {
      errors.push('Applicant ID is required');
    }

    if (!data.projectId) {
      errors.push('Project ID is required');
    }

    if (!data.position || typeof data.position !== 'string' || data.position.trim().length === 0) {
      errors.push('Position is required');
    }

    if (data.message && typeof data.message === 'string' && data.message.length > 2000) {
      errors.push('Message must be less than 2000 characters');
    }

    if (data.skills && !Array.isArray(data.skills)) {
      errors.push('Skills must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Application Status Enum
 */
export const ApplicationStatus = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});

export default Application;
