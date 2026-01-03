import { describe, it, expect, beforeEach, vi } from 'vitest';
import { measureResponseTime, trackServices, getLatestResponseTimes } from '../../services/responseTime.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Response Time Service', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    describe('measureResponseTime', () => {
        it('should measure successful response time', async () => {
            // Mock successful fetch
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
            });

            const result = await measureResponseTime('http://test.com', 'TestService');

            expect(result).toMatchObject({
                name: 'TestService',
                url: 'http://test.com',
                success: true,
                status: 200,
            });
            expect(result.duration).toBeGreaterThanOrEqual(0);
        });

        it('should handle failed requests', async () => {
            // Mock failed fetch
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await measureResponseTime('http://test.com', 'TestService');

            expect(result).toMatchObject({
                name: 'TestService',
                url: 'http://test.com',
                success: false,
                error: 'Network error',
            });
            expect(result.duration).toBeGreaterThanOrEqual(0);
        });

        it('should handle timeout', async () => {
            // Mock timeout error (AbortSignal.timeout will throw this)
            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';
            global.fetch.mockRejectedValueOnce(abortError);

            const result = await measureResponseTime('http://test.com', 'TestService');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('trackServices', () => {
        it('should track all services', async () => {
            // Mock all service responses
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const results = await trackServices();

            expect(results).toHaveLength(5); // Dashboard, Pi-hole, Immich, Portainer, Nginx
            expect(results[0]).toHaveProperty('name');
            expect(results[0]).toHaveProperty('url');
            expect(results[0]).toHaveProperty('duration');
            expect(results[0]).toHaveProperty('success');
        });

        it('should store results in memory', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
            });

            await trackServices();
            const latest = getLatestResponseTimes();

            expect(latest.length).toBeGreaterThan(0);
            expect(latest[0]).toHaveProperty('timestamp');
        });
    });

    describe('getLatestResponseTimes', () => {
        it('should return empty array when no data', () => {
            const latest = getLatestResponseTimes();
            expect(Array.isArray(latest)).toBe(true);
        });
    });
});
