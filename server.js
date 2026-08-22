const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

// Helper to load JSON files safely
function loadJson(fileName) {
  try {
    const filePath = path.join(__dirname, 'data', fileName);
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading ${fileName}:`, err.message);
    return [];
  }
}

// ----------------------------------------------------
// Health & Info Endpoint
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'MCNC Super App Server',
    version: '1.0.0',
    endpoints: {
      auth_login: 'POST /api/auth/login',
      auth_users: 'GET /api/auth/users',
      auth_profile: 'GET /api/auth/profile',
      miniapps_list: 'GET /api/miniapps',
      miniapps_detail: 'GET /api/miniapps/:appId',
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ----------------------------------------------------
// 1. Authentication APIs
// ----------------------------------------------------

/**
 * POST /api/auth/login
 * Body: { userId, password }
 */
app.post('/api/auth/login', (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: 'User ID and Password are required.'
    });
  }

  const users = loadJson('users.json');
  const user = users.find(
    (u) => u.userId.toLowerCase() === userId.trim().toLowerCase() && u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid User ID or Password.'
    });
  }

  // Create safe user profile object without password
  const { password: _, ...userProfile } = user;

  // Generate session token
  const token = `superapp_session_${userProfile.userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token: token,
    user: userProfile
  });
});

/**
 * GET /api/auth/users
 * Returns list of demo users (passwords omitted)
 */
app.get('/api/auth/users', (req, res) => {
  const users = loadJson('users.json');
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json({
    success: true,
    count: safeUsers.length,
    users: safeUsers
  });
});

/**
 * GET /api/auth/profile
 * Requires Authorization: Bearer <token>
 */
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];
  // Extract userId from token pattern superapp_session_<userId>_...
  const parts = token.split('_');
  const userId = parts[2];

  const users = loadJson('users.json');
  const user = users.find((u) => u.userId.toLowerCase() === (userId || '').toLowerCase());

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User session not found.'
    });
  }

  const { password: _, ...userProfile } = user;
  res.json({
    success: true,
    user: userProfile
  });
});

// ----------------------------------------------------
// 2. Mini App Catalog APIs
// ----------------------------------------------------

/**
 * GET /api/miniapps
 * Optional query params:
 *   ?section=discover|categories|popular
 *   ?category=cat_entertainment|cat_shop|...
 *   ?search=cinema|flutter...
 */
app.get('/api/miniapps', (req, res) => {
  let apps = loadJson('miniapps.json');
  const { section, category, search } = req.query;

  if (section) {
    apps = apps.filter((app) => app.section === section);
  }

  if (category) {
    apps = apps.filter((app) => app.categoryId === category);
  }

  if (search) {
    const q = search.toLowerCase();
    apps = apps.filter(
      (app) =>
        (app.title && app.title.toLowerCase().includes(q)) ||
        (app.description && app.description.toLowerCase().includes(q)) ||
        (app.appId && app.appId.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: apps.length,
    data: apps
  });
});

/**
 * GET /api/miniapps/:appId
 */
app.get('/api/miniapps/:appId', (req, res) => {
  const { appId } = req.params;
  const apps = loadJson('miniapps.json');
  const appItem = apps.find((a) => a.appId === appId);

  if (!appItem) {
    return res.status(404).json({
      success: false,
      message: `Mini App '${appId}' not found.`
    });
  }

  res.json({
    success: true,
    data: appItem
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 Mini App & Auth Server running at http://0.0.0.0:${PORT}`);
  console.log(`🔑 Login endpoint:   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📱 Mini Apps list:   GET  http://localhost:${PORT}/api/miniapps`);
  console.log('====================================================');
});
