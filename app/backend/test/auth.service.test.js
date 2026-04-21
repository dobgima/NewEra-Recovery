"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../src/auth/services/auth.service");
const prisma_1 = require("../../src/common/db/prisma");
const app_error_1 = require("../../src/common/errors/app-error");
// Mock dependencies
jest.mock('../../src/common/db/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        userProfile: {
            create: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));
jest.mock('../../src/common/config/env', () => ({
    env: {
        jwtAccessSecret: 'test-access-secret',
        jwtRefreshSecret: 'test-refresh-secret',
        jwtAccessExpiresIn: '15m',
        jwtRefreshExpiresIn: '30d',
    },
}));
jest.mock('../../src/common/audit/audit.service', () => ({
    audit: {
        userLogin: jest.fn(),
    },
}));
describe('AuthService', () => {
    let authService;
    beforeEach(() => {
        authService = new auth_service_1.AuthService();
        jest.clearAllMocks();
    });
    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Mock existing user check - user doesn't exist
            prisma_1.prisma.user.findUnique.mockResolvedValue(null);
            // Mock transaction
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
                role: 'USER',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const mockProfile = {
                id: 'profile-123',
                userId: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'John',
            };
            prisma_1.prisma.$transaction.mockImplementation(async (callback) => {
                return callback({
                    user: { create: jest.fn().mockResolvedValue(mockUser) },
                    userProfile: { create: jest.fn().mockResolvedValue(mockProfile) },
                });
            });
            // Mock token generation
            jest.spyOn(authService, 'generateTokens').mockResolvedValue({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });
            const result = await authService.register({
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'John',
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.user.email).toBe('test@example.com');
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
        });
        it('should throw error if user already exists', async () => {
            // Mock existing user
            prisma_1.prisma.user.findUnique.mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
            });
            await expect(authService.register({
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'John',
                email: 'test@example.com',
                password: 'password123',
            })).rejects.toThrow(app_error_1.AppError);
            expect(prisma_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
    });
    describe('login', () => {
        it('should login user with valid credentials', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
                role: 'USER',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                profile: {
                    id: 'profile-123',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            };
            prisma_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            // Mock bcrypt compare
            const bcrypt = require('bcrypt');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            // Mock token generation
            jest.spyOn(authService, 'generateTokens').mockResolvedValue({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            });
            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.user.email).toBe('test@example.com');
            expect(result.tokens).toHaveProperty('accessToken');
        });
        it('should throw error for invalid email', async () => {
            prisma_1.prisma.user.findUnique.mockResolvedValue(null);
            await expect(authService.login({
                email: 'nonexistent@example.com',
                password: 'password123',
            })).rejects.toThrow(app_error_1.AppError);
        });
        it('should throw error for invalid password', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
            };
            prisma_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            // Mock bcrypt compare to return false
            const bcrypt = require('bcrypt');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
            await expect(authService.login({
                email: 'test@example.com',
                password: 'wrongpassword',
            })).rejects.toThrow(app_error_1.AppError);
        });
    });
});
