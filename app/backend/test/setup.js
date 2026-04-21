"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock Prisma for tests
jest.mock('../src/common/db/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userProfile: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        checkIn: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            updateMany: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));
// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});
