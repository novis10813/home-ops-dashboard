import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendDiscordNotification, sendHealthAlert, sendServiceDownAlert } from '../../services/discord.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Discord Notification Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockWebhookUrl = 'https://discord.com/api/webhooks/test';

    describe('sendDiscordNotification', () => {
        it('should send notification successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
            });

            const result = await sendDiscordNotification(mockWebhookUrl, 'Test message');

            expect(result).toEqual({ success: true });
            expect(global.fetch).toHaveBeenCalledWith(
                mockWebhookUrl,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        it('should handle Discord API errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await sendDiscordNotification(mockWebhookUrl, 'Test message');

            expect(result).toEqual({
                success: false,
                error: 'Network error',
            });
        });

        it('should handle non-OK responses', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
            });

            const result = await sendDiscordNotification(mockWebhookUrl, 'Test message');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should include custom options in embed', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
            });

            await sendDiscordNotification(mockWebhookUrl, 'Test', {
                title: 'Custom Title',
                color: 0x00ff00,
                fields: [{ name: 'Field', value: 'Value' }],
            });

            const callArgs = global.fetch.mock.calls[0][1];
            const body = JSON.parse(callArgs.body);

            expect(body.embeds[0].title).toBe('Custom Title');
            expect(body.embeds[0].color).toBe(0x00ff00);
            expect(body.embeds[0].fields).toHaveLength(1);
        });
    });

    describe('sendHealthAlert', () => {
        it('should send health alert with correct format', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
            });

            await sendHealthAlert(mockWebhookUrl, 'nginx', 'unhealthy');

            const callArgs = global.fetch.mock.calls[0][1];
            const body = JSON.parse(callArgs.body);

            expect(body.embeds[0].title).toBe('⚠️ Container Health Alert');
            expect(body.embeds[0].description).toContain('nginx');
            expect(body.embeds[0].description).toContain('unhealthy');
        });
    });

    describe('sendServiceDownAlert', () => {
        it('should send service down alert', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
            });

            await sendServiceDownAlert(mockWebhookUrl, 'Dashboard', 'Connection timeout');

            const callArgs = global.fetch.mock.calls[0][1];
            const body = JSON.parse(callArgs.body);

            expect(body.embeds[0].title).toBe('🚨 Service Down Alert');
            expect(body.embeds[0].description).toContain('Dashboard');
        });
    });
});
