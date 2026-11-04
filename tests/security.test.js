
const request = require('supertest');
const app = require('../src/app');

describe('Security regression tests', () => {
  test('should escape HTML in the /hello route', async () => {
    const payload = '<script>alert(1)</script>';

    const res = await request(app)
      .get('/hello')
      .query({ name: payload });

    expect(res.status).toBe(200);
    expect(res.text).not.toContain('<script>');
    expect(res.text).toContain('&lt;script&gt;');
  });

  test('should reject a host containing a shell command on /ping', async () => {
    const payload = 'google.com;cat /etc/passwd';

    const res = await request(app)
      .get('/ping')
      .query({ host: payload });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nom d’hôte invalide.');
  });

  test('should ignore unauthorized keys on /prefs', async () => {
    const res = await request(app)
      .get('/prefs')
      .query({
        theme: 'light',
        lang: 'fr',
        admin: 'true',
        '__proto__[admin]': 'true',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      theme: 'light',
      lang: 'fr',
    });
    expect(res.body.admin).toBeUndefined();
  });
});
