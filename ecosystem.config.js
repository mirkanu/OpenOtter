// Parse the shared env file with Node fs to avoid PM2's shell-based parser
// failing on lines with unquoted spaces (e.g. display names with < >)
const fs = require('fs');
function loadEnv(filePath) {
  try {
    const env = {};
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch (_) { return {}; }
}

const sharedEnv = loadEnv('/home/services/.env.production');

module.exports = {
  apps: [
    {
      name: 'openotter',
      script: 'node_modules/.bin/next',
      args: 'start -p 3009',
      cwd: '/data/home/OpenOtter',
      env: {
        ...sharedEnv,
        NODE_ENV: 'production',
        PORT: '3009',
        UPLOAD_DIR: '/home/services/openotter/uploads',
        DATABASE_PATH: '/home/services/openotter/openotter.db',
        NEXT_PUBLIC_APP_URL: 'https://otter.gsdlabs.dev',
        NOTIFICATION_EMAIL: 'manuelkuhs@gmail.com',
        OPENOTTER_RESEND_FROM: 'OpenOtter <noreply@mail.gsdlabs.dev>',
      },
      max_memory_restart: '400M',
      restart_delay: 5000,
      log_file: '/home/services/openotter/logs/openotter.log',
      error_file: '/home/services/openotter/logs/openotter-error.log',
      out_file: '/home/services/openotter/logs/openotter-out.log',
    },
  ],
};
