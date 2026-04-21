import { prisma } from '../db/prisma';
import { logger } from '../logger/logger';

export enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGOUT_ALL = 'USER_LOGOUT_ALL',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  TWO_FACTOR_SETUP_INITIATED = 'TWO_FACTOR_SETUP_INITIATED',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_VERIFIED = 'TWO_FACTOR_VERIFIED',

  // User management
  USER_REGISTER = 'USER_REGISTER',
  USER_PROFILE_UPDATE = 'USER_PROFILE_UPDATE',
  USER_PREFERENCES_UPDATE = 'USER_PREFERENCES_UPDATE',

  // Sensitive data access
  CRISIS_PLAN_ACCESS = 'CRISIS_PLAN_ACCESS',
  CRISIS_PLAN_UPDATE = 'CRISIS_PLAN_UPDATE',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',

  // Peer support
  PEER_REQUEST_CREATED = 'PEER_REQUEST_CREATED',
  PEER_REQUEST_ACCEPTED = 'PEER_REQUEST_ACCEPTED',
  PEER_REQUEST_DECLINED = 'PEER_REQUEST_DECLINED',

  // Admin actions
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
}

export interface AuditEvent {
  eventType: AuditEventType;
  userId?: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export class AuditService {
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      // Store in database
      await prisma.auditLog.create({
        data: {
          eventType: event.eventType,
          userId: event.userId,
          resourceId: event.resourceId,
          resourceType: event.resourceType,
          action: event.action,
          details: event.details || {},
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          sessionId: event.sessionId,
        },
      });

      // Log to structured logger
      logger.info({
        event: 'audit_event',
        eventType: event.eventType,
        userId: event.userId,
        resourceId: event.resourceId,
        resourceType: event.resourceType,
        action: event.action,
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        sessionId: event.sessionId,
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      logger.error({ error, event }, 'Failed to log audit event');
    }
  }

  async getAuditLogs(
    userId?: string,
    eventType?: AuditEventType,
    limit: number = 100,
    offset: number = 0
  ) {
    return prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(eventType && { eventType }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUserActivity(userId: string, limit: number = 50) {
    return this.getAuditLogs(userId, undefined, limit);
  }
}

// Singleton instance
export const auditService = new AuditService();

// Helper functions for common audit events
export const audit = {
  userLogin: (userId: string, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.USER_LOGIN,
      userId,
      action: 'User logged in',
      ipAddress,
      userAgent,
    }),

  userLogout: (userId: string, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.USER_LOGOUT,
      userId,
      action: 'User logged out',
      ipAddress,
      userAgent,
    }),

  userLogoutAll: (userId: string, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.USER_LOGOUT_ALL,
      userId,
      action: 'User logged out from all devices',
      ipAddress,
      userAgent,
    }),

  tokenRefresh: (userId: string, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.TOKEN_REFRESH,
      userId,
      action: 'Token refreshed',
      ipAddress,
      userAgent,
    }),

  crisisPlanAccess: (userId: string, crisisPlanId: string, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.CRISIS_PLAN_ACCESS,
      userId,
      resourceId: crisisPlanId,
      resourceType: 'crisis_plan',
      action: 'Crisis plan accessed',
      ipAddress,
      userAgent,
    }),

  riskAssessment: (userId: string, riskLevel: string, score: number, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.RISK_ASSESSMENT,
      userId,
      action: 'Risk assessment performed',
      details: { riskLevel, score },
      ipAddress,
      userAgent,
    }),

  peerRequestCreated: (requesterId: string, recipientId: string, ipAddress?: string, userAgent?: string) =>
    auditService.logEvent({
      eventType: AuditEventType.PEER_REQUEST_CREATED,
      userId: requesterId,
      resourceId: recipientId,
      resourceType: 'peer_request',
      action: 'Peer support request created',
      ipAddress,
      userAgent,
    }),

  passwordResetRequested: (userId: string, email: string) =>
    auditService.logEvent({
      eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
      userId,
      action: 'Password reset requested',
      details: { email },
    }),

  passwordResetCompleted: (userId: string, email: string) =>
    auditService.logEvent({
      eventType: AuditEventType.PASSWORD_RESET_COMPLETED,
      userId,
      action: 'Password successfully reset',
      details: { email },
    }),

  twoFactorSetupInitiated: (userId: string, method: string) =>
    auditService.logEvent({
      eventType: AuditEventType.TWO_FACTOR_SETUP_INITIATED,
      userId,
      action: '2FA setup initiated',
      details: { method },
    }),

  twoFactorEnabled: (userId: string, method: string) =>
    auditService.logEvent({
      eventType: AuditEventType.TWO_FACTOR_ENABLED,
      userId,
      action: 'Two-factor authentication enabled',
      details: { method },
    }),

  twoFactorDisabled: (userId: string) =>
    auditService.logEvent({
      eventType: AuditEventType.TWO_FACTOR_DISABLED,
      userId,
      action: 'Two-factor authentication disabled',
    }),

  twoFactorVerified: (userId: string) =>
    auditService.logEvent({
      eventType: AuditEventType.TWO_FACTOR_VERIFIED,
      userId,
      action: '2FA verified during login',
    }),
};