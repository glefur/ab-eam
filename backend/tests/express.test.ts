import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { expressApp } from '../src/config/express';

describe('Express Configuration', () => {
  let app: any;

  beforeAll(() => {
    app = expressApp.getApp();
  });

  test('should return 200 for health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  test('should return 200 for root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('endpoints');
  });

  test('should return 200 for API base endpoint', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('should return 404 for non-existent route', async () => {
    const response = await request(app).get('/non-existent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Route not found');
    expect(response.body).toHaveProperty('code', 'ROUTE_NOT_FOUND');
  });

  test('should include CORS headers', async () => {
    const response = await request(app).get('/health');
    expect(response.headers).toHaveProperty('access-control-allow-origin');
  });

  test('should include security headers from helmet', async () => {
    const response = await request(app).get('/health');
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-xss-protection');
  });
}); 