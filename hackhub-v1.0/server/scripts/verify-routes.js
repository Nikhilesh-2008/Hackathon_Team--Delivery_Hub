import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../index.js';
import { CANONICAL_ROUTES } from '../routes/routeRegistry.js';
import { apiRoutes } from '../../src/services/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyRoutes = async () => {
  console.log('====================================================');
  console.log('API ROUTE VERIFICATION');
  console.log('====================================================\n');

  let duplicateCount = 0;
  let missingCount = 0;
  let undocumentedCount = 0;
  let conflictingCount = 0;
  const failureReasons = [];

  // 1. Extract Mounted Routes from Express App
  const mountedRoutes = [];
  const apiLayer = app.router?.stack?.find((l) => l.name === 'router');
  if (apiLayer && apiLayer.handle?.stack) {
    for (const sublayer of apiLayer.handle.stack) {
      if (sublayer.handle?.stack) {
        for (const layer of sublayer.handle.stack) {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
            const routePath = ('/api' + layer.route.path).replace(/\/+/g, '/').replace(/\/$/, '');
            for (const method of methods) {
              mountedRoutes.push({
                method,
                path: routePath || '/',
              });
            }
          }
        }
      }
    }
  }

  // Check Duplicate Mounted Routes
  const mountedKeys = new Set();
  const mountedDupes = [];
  for (const r of mountedRoutes) {
    const key = `${r.method} ${r.path}`;
    if (mountedKeys.has(key)) {
      mountedDupes.push(key);
      duplicateCount++;
    }
    mountedKeys.add(key);
  }

  // 2. Extract Documented Routes from docs/API_ROUTES.md
  const docsPath = path.resolve(__dirname, '../../docs/API_ROUTES.md');
  const docsContent = fs.readFileSync(docsPath, 'utf-8');
  const docRegex = /\|\s*(GET|POST|PATCH|DELETE|PUT)\s*\|\s*`([^`]+)`/g;
  const documentedRoutes = [];
  let match;
  while ((match = docRegex.exec(docsContent)) !== null) {
    documentedRoutes.push({
      method: match[1].toUpperCase(),
      path: match[2].trim(),
    });
  }

  // 3. Extract Frontend Routes from apiRoutes registry
  const frontendRouteTemplates = new Set();
  const extractFrontendTemplates = (obj, prefix = '') => {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'function') {
        try {
          // Call with sample dummy parameter placeholders
          const resolved = val('PARAM1', 'PARAM2', 'PARAM3');
          // Normalize dynamic params: /api/events/PARAM1 -> /api/events/:eventId pattern
          const normalized = resolved
            .replace(/\/PARAM1(?=\/|$)/, '/:id1')
            .replace(/\/PARAM2(?=\/|$)/, '/:id2')
            .replace(/\/PARAM3(?=\/|$)/, '/:id3');
          frontendRouteTemplates.add(normalized);
        } catch {}
      } else if (typeof val === 'object' && val !== null) {
        extractFrontendTemplates(val, `${prefix}${key}.`);
      }
    }
  };
  extractFrontendTemplates(apiRoutes);

  // 4. Verify Registered vs Mounted
  for (const reg of CANONICAL_ROUTES) {
    const key = `${reg.method} ${reg.path}`;
    if (!mountedKeys.has(key)) {
      missingCount++;
      failureReasons.push(`Registered route not mounted in Express: ${key}`);
    }

    // Verify /api prefix
    if (!reg.path.startsWith('/api/')) {
      conflictingCount++;
      failureReasons.push(`Registered route missing '/api/' prefix: ${reg.path}`);
    }

    // Verify controller and service strings
    if (!reg.controller || !reg.service) {
      failureReasons.push(`Route ${key} missing controller or service declaration`);
    }
  }

  // 5. Verify Documented vs Registered
  const registeredKeys = new Set(CANONICAL_ROUTES.map((r) => `${r.method} ${r.path}`));
  const documentedKeys = new Set(documentedRoutes.map((r) => `${r.method} ${r.path}`));

  for (const regKey of registeredKeys) {
    if (!documentedKeys.has(regKey)) {
      undocumentedCount++;
      failureReasons.push(`Registered route not found in API_ROUTES.md: ${regKey}`);
    }
  }

  for (const docKey of documentedKeys) {
    if (!registeredKeys.has(docKey)) {
      conflictingCount++;
      failureReasons.push(`Documented route not found in CANONICAL_ROUTES: ${docKey}`);
    }
  }

  // 6. Check for Obsolete / Conflicting Route Aliases
  const forbiddenAliases = [
    '/api/hackathons',
    '/api/candidates',
    '/api/users/me',
    '/api/teams/my-team',
    '/api/getEvents',
    '/api/events/list',
    '/v1/',
  ];

  for (const r of mountedRoutes) {
    for (const forbidden of forbiddenAliases) {
      if (r.path.includes(forbidden)) {
        conflictingCount++;
        failureReasons.push(`Conflicting deprecated route found: ${r.method} ${r.path}`);
      }
    }
  }

  // Print Summary
  console.log(`Registered routes: ${CANONICAL_ROUTES.length}`);
  console.log(`Mounted routes:    ${mountedRoutes.length}`);
  console.log(`Documented routes: ${documentedRoutes.length}`);
  console.log(`Frontend routes:   ${frontendRouteTemplates.size}`);
  console.log('');
  console.log(`Duplicate routes:    ${duplicateCount}`);
  console.log(`Missing routes:      ${missingCount}`);
  console.log(`Undocumented routes: ${undocumentedCount}`);
  console.log(`Conflicting routes:  ${conflictingCount}`);
  console.log('');

  if (failureReasons.length > 0) {
    console.error('FAILURES DETECTED:');
    failureReasons.forEach((f) => console.error(`  ✗ ${f}`));
    console.log('\nRESULT: FAIL\n');
    process.exit(1);
  } else {
    console.log('RESULT: PASS\n');
    console.log('====================================================');
    return true;
  }
};

// Direct script execution
if (process.argv[1] && process.argv[1].endsWith('verify-routes.js')) {
  verifyRoutes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default verifyRoutes;
