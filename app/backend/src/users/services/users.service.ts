import { prisma } from '../../common/db/prisma';
import { cacheService, CacheService } from '../../common/cache/cache.service';
import { AppError, ErrorCodes } from '../../common/errors/app-error';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AuditService, AuditEventType } from '../../common/audit/audit.service';

const auditService = new AuditService();

export class UsersService {
  async getMe(userId: string) {
    const cacheKey = CacheService.userProfileKey(userId);

    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Cache for 30 minutes (user profile changes infrequently)
    await cacheService.set(cacheKey, user, 1800);

    return user;
  }

  async updateMe(userId: string, updateData: UpdateProfileDto) {
    const { 
      firstName, lastName, displayName, zipCode, sobrietyDate, phone, avatarUrl, insuranceProvider, timezone,
      notificationPrefs, reminderPrefs, theme, primaryModality, secondaryModality, wantsReminders, wantsPeerSupport, dailyCheckinHour
    } = updateData;

    const profileData: Record<string, any> = {};
    if (firstName !== undefined) profileData.firstName = firstName;
    if (lastName !== undefined) profileData.lastName = lastName;
    if (displayName !== undefined) profileData.displayName = displayName;
    if (zipCode !== undefined) profileData.zipCode = zipCode;
    if (sobrietyDate !== undefined) profileData.sobrietyDate = sobrietyDate ? new Date(sobrietyDate) : null;
    if (phone !== undefined) profileData.phone = phone;
    if (avatarUrl !== undefined) profileData.avatarUrl = avatarUrl;
    if (insuranceProvider !== undefined) profileData.insuranceProvider = insuranceProvider;
    if (timezone !== undefined) profileData.timezone = timezone;

    const preferencesData: Record<string, any> = {};
    if (primaryModality !== undefined) preferencesData.primaryModality = primaryModality;
    if (secondaryModality !== undefined) preferencesData.secondaryModality = secondaryModality;
    if (wantsReminders !== undefined) preferencesData.wantsReminders = wantsReminders;
    if (wantsPeerSupport !== undefined) preferencesData.wantsPeerSupport = wantsPeerSupport;
    if (dailyCheckinHour !== undefined) preferencesData.dailyCheckinHour = dailyCheckinHour;
    if (notificationPrefs !== undefined) preferencesData.notificationPrefs = notificationPrefs;
    if (reminderPrefs !== undefined) preferencesData.reminderPrefs = reminderPrefs;
    if (theme !== undefined) preferencesData.theme = theme;

    const updatePayload: Record<string, any> = {};

    if (Object.keys(profileData).length > 0) {
      updatePayload.profile = {
        upsert: {
          create: profileData,
          update: profileData,
        },
      };
    }

    if (Object.keys(preferencesData).length > 0) {
      updatePayload.preferences = {
        upsert: {
          create: preferencesData,
          update: preferencesData,
        },
      };
    }

    if (Object.keys(updatePayload).length === 0) {
      // No changes, return current user
      return this.getMe(userId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
      include: {
        profile: true,
        preferences: true,
      },
    });

    // Invalidate cache
    const cacheKey = CacheService.userProfileKey(userId);
    await cacheService.delete(cacheKey);

    // Log profile update for audit trail
    await auditService.logEvent({
      eventType: AuditEventType.USER_PROFILE_UPDATE,
      userId,
      action: 'User profile updated',
      details: updateData,
    });

    return updatedUser;
  }

  private async auditProfileUpdate(userId: string, changes: UpdateProfileDto) {
    // This method is now called from logEvent
    // Kept for backward compatibility
  }
}