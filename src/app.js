
const express = require('express');
const { execFile } = require('child_process');
const { rateLimit } = require('express-rate-limit');

const app = express();

// Limitation du nombre de requêtes sur la route /ping.
const pingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Trop de requêtes. Réessayez dans une minute.',
  },
});

// Validation stricte d'un nom d'hôte.
const HOSTNAME_REGEX =
  /^(?=.{1,253}$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Échappement des caractères spéciaux HTML.
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Message de bienvenue : protection contre les XSS.
app.get('/hello', (req, res) => {
  const name =
    typeof req.query.name === 'string' && req.query.name.length > 0
      ? req.query.name
      : 'inconnu';

  res.type('html').send(`<h1>Bonjour ${escapeHtml(name)}</h1>`);
});

// Outil réseau : ping un hôte sans passer par un shell.
app.get('/ping', pingLimiter, (req, res) => {
  const host = req.query.host;

  if (typeof host !== 'string' || !HOSTNAME_REGEX.test(host)) {
    return res.status(400).json({
      error: 'Nom d’hôte invalide.',
    });
  }

  execFile('ping', ['-c', '1', host], (err, stdout) => {
    if (err) {
      return res.status(500).send('Erreur lors du ping.');
    }

    res.type('text').send(stdout);
  });
});

// Préférences utilisateur : seules les clés autorisées sont acceptées.
app.get('/prefs', (req, res) => {
  const allowedThemes = ['light', 'dark'];
  const allowedLanguages = ['fr', 'en'];

  const theme =
    typeof req.query.theme === 'string' &&
    allowedThemes.includes(req.query.theme)
      ? req.query.theme
      : 'light';

  const lang =
    typeof req.query.lang === 'string' &&
    allowedLanguages.includes(req.query.lang)
      ? req.query.lang
      : 'fr';

  res.json({ theme, lang });
});

module.exports = app;
