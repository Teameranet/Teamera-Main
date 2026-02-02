/**
 * Application Use Cases - Domain Layer
 * Application business rules for project applications
 *
 * Clean Architecture: Use Cases (Application Business Rules)
 * - Orchestrate the flow of data to and from entities
 * - Contain application-specific business rules
 * - Independent of UI, database, and external frameworks
 */

import { Application, ApplicationStatus } from '../../entities/Application.js';

/**
 * Create Application Use Case
 * Handles the creation of a new project application
 */
export class CreateApplicationUseCase {
  constructor({ applicationRepository, projectRepository, userRepository }) {
    this.applicationRepository = applicationRepository;
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case
   * @param {object} input - Application input data
   * @returns {Promise<Application>}
   */
  async execute(input) {
    const {
      applicantId,
      projectId,
      position,
      skills = [],
      message = '',
      resumeUrl = null,
    } = input;

    // Validate input
    const validation = Application.validate(input);
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.name = 'ValidationError';
      throw error;
    }

    // Check if project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check if applicant exists
    const applicant = await this.userRepository.findById(applicantId);
    if (!applicant) {
      const error = new Error('Applicant not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Check if user is already a team member
    if (project.isTeamMember(applicantId) || project.isOwner(applicantId)) {
      const error = new Error('You are already part of this project');
      error.name = 'ConflictError';
      throw error;
    }

    // Check if application already exists
    const existingApplication = await this.applicationRepository.exists(
      applicantId,
      projectId
    );
    if (existingApplication) {
      const error = new Error('You have already applied to this project');
      error.name = 'ConflictError';
      throw error;
    }

    // Create application entity
    const application = new Application({
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicantId,
      applicantName: applicant.name,
      applicantEmail: applicant.email,
      applicantAvatar: applicant.avatar,
      projectId,
      projectName: project.title,
      position,
      skills,
      message,
      status: ApplicationStatus.PENDING,
      hasResume: !!resumeUrl,
      resumeUrl,
      userDetails: applicant.toPublicProfile(),
      appliedDate: new Date().toISOString(),
    });

    // Save application
    const savedApplication = await this.applicationRepository.create(application);

    // Increment project application count
    await this.projectRepository.incrementApplicationCount(projectId);

    return savedApplication;
  }
}

/**
 * Get Application By Id Use Case
 */
export class GetApplicationByIdUseCase {
  constructor({ applicationRepository }) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicationId) {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      const error = new Error('Application not found');
      error.name = 'NotFoundError';
      throw error;
    }

    return application;
  }
}

/**
 * Get Applications By Project Use Case
 */
export class GetApplicationsByProjectUseCase {
  constructor({ applicationRepository, projectRepository }) {
    this.applicationRepository = applicationRepository;
    this.projectRepository = projectRepository;
  }

  async execute(projectId, userId, status = null) {
    // Verify project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Only project owner can view applications
    if (!project.isOwner(userId)) {
      const error = new Error('Only project owner can view applications');
      error.name = 'ForbiddenError';
      throw error;
    }

    return this.applicationRepository.findByProjectId(projectId, status);
  }
}

/**
 * Get Applications By Applicant Use Case
 */
export class GetApplicationsByApplicantUseCase {
  constructor({ applicationRepository }) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicantId, status = null) {
    return this.applicationRepository.findByApplicantId(applicantId, status);
  }
}

/**
 * Get Received Applications Use Case
 * Get all applications for projects owned by a user
 */
export class GetReceivedApplicationsUseCase {
  constructor({ applicationRepository }) {
    this.applicationRepository = applicationRepository;
  }

  async execute(ownerId, status = null) {
    return this.applicationRepository.findByProjectOwnerId(ownerId, status);
  }
}

/**
 * Accept Application Use Case
 */
export class AcceptApplicationUseCase {
  constructor({ applicationRepository, projectRepository, userRepository }) {
    this.applicationRepository = applicationRepository;
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  async execute(applicationId, reviewerId) {
    // Get application
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Get project
    const project = await this.projectRepository.findById(application.projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Verify reviewer is project owner
    if (!project.isOwner(reviewerId)) {
      const error = new Error('Only project owner can accept applications');
      error.name = 'ForbiddenError';
      throw error;
    }

    // Check application is pending
    if (!application.isPending()) {
      const error = new Error('Application has already been processed');
      error.name = 'ConflictError';
      throw error;
    }

    // Get applicant
    const applicant = await this.userRepository.findById(application.applicantId);
    if (!applicant) {
      const error = new Error('Applicant not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Accept application
    application.accept(reviewerId);
    await this.applicationRepository.update(applicationId, application.toJSON());

    // Add applicant to project team
    await this.projectRepository.addTeamMember(project.id, {
      id: applicant.id,
      name: applicant.name,
      role: application.position,
      avatar: applicant.avatar,
      email: applicant.email,
    });

    return application;
  }
}

/**
 * Reject Application Use Case
 */
export class RejectApplicationUseCase {
  constructor({ applicationRepository, projectRepository }) {
    this.applicationRepository = applicationRepository;
    this.projectRepository = projectRepository;
  }

  async execute(applicationId, reviewerId, reason = null) {
    // Get application
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Get project
    const project = await this.projectRepository.findById(application.projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Verify reviewer is project owner
    if (!project.isOwner(reviewerId)) {
      const error = new Error('Only project owner can reject applications');
      error.name = 'ForbiddenError';
      throw error;
    }

    // Check application is pending
    if (!application.isPending()) {
      const error = new Error('Application has already been processed');
      error.name = 'ConflictError';
      throw error;
    }

    // Reject application
    application.reject(reviewerId, reason);
    await this.applicationRepository.update(applicationId, application.toJSON());

    return application;
  }
}

/**
 * Withdraw Application Use Case
 */
export class WithdrawApplicationUseCase {
  constructor({ applicationRepository }) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicationId, applicantId) {
    // Get application
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Verify user is the applicant
    if (application.applicantId !== applicantId) {
      const error = new Error('Only applicant can withdraw their application');
      error.name = 'ForbiddenError';
      throw error;
    }

    // Check application is pending
    if (!application.isPending()) {
      const error = new Error('Application has already been processed');
      error.name = 'ConflictError';
      throw error;
    }

    // Withdraw application
    application.withdraw();
    await this.applicationRepository.update(applicationId, application.toJSON());

    return application;
  }
}

/**
 * Delete Application Use Case
 */
export class DeleteApplicationUseCase {
  constructor({ applicationRepository }) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicationId, userId) {
    // Get application
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // Only applicant can delete their application
    if (application.applicantId !== userId) {
      const error = new Error('Only applicant can delete their application');
      error.name = 'ForbiddenError';
      throw error;
    }

    await this.applicationRepository.delete(applicationId);
    return true;
  }
}

/**
 * Get Application Statistics Use Case
 */
export class GetApplicationStatisticsUseCase {
  constructor({ applicationRepository }) {
    this.applicationRepository = applicationRepository;
  }

  async execute(projectId) {
    return this.applicationRepository.countByStatusForProject(projectId);
  }
}

export default {
  CreateApplicationUseCase,
  GetApplicationByIdUseCase,
  GetApplicationsByProjectUseCase,
  GetApplicationsByApplicantUseCase,
  GetReceivedApplicationsUseCase,
  AcceptApplicationUseCase,
  RejectApplicationUseCase,
  WithdrawApplicationUseCase,
  DeleteApplicationUseCase,
  GetApplicationStatisticsUseCase,
};
