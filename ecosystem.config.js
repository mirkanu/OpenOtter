module.exports = {
  apps: [
    {
      name: 'openotter',
      script: 'node_modules/.bin/next',
      args: 'start -p 3009',
      cwd: '/data/home/OpenOtter',
      env_file: '/home/services/.env.production',
      env: {
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
