import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPiholeStats, checkPiholeDNS } from '../../services/piholeMonitor.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Pi-hole Monitor Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPiholeStats', () => {
        it('should fetch Pi-hole statistics successfully', async () => {
            // Mock successful Pi-hole API response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    dns_queries_today: 1234,
                    ads_blocked_today: 567,
                    ads_percentage_today: 45.9,
                    domains_being_blocked: 81273,
                    unique_clients: 5,
                }),
            });

            const stats = await getPiholeStats();

            expect(stats).toEqual({
                status: 'healthy',
                queries_today: 1234,
                blocked_today: 567,
                percent_blocked: 45.9,
                domains_blocked: 81273,
                unique_clients: 5,
            });
        });

        it('should handle Pi-hole API errors', async () => {
            // Mock failed request
            global.fetch.mockRejectedValueOnce(new Error('Connection refused'));

            const stats = await getPiholeStats();

            expect(stats).toEqual({
                status: 'unhealthy',
                error: 'Connection refused',
            });
        });

        it('should handle non-OK HTTP responses', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const stats = await getPiholeStats();

            expect(stats.status).toBe('unhealthy');
            expect(stats.error).toBeDefined();
        });
    });

    describe('checkPiholeDNS', () => {
        it('should return true when DNS is responding', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
            });

            const result = await checkPiholeDNS();

            expect(result).toEqual({
                dns_responding: true,
                status_code: 200,
            });
        });

        it('should return false when DNS is not responding', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Timeout'));

            const result = await checkPiholeDNS();

            expect(result).toEqual({
                dns_responding: false,
                error: 'Timeout',
            });
        });
    });
});
