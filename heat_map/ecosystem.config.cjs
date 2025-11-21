module.exports = {
  apps: [
    // Frontend Development Server
    {
      name: 'vite-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '.',
      env: {
        NODE_ENV: 'development',
        VITE_DEV_PORT: 5173
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      log_file: './logs/vite-frontend.log',
      out_file: './logs/vite-frontend-out.log',
      error_file: './logs/vite-frontend-error.log'
    },

    /* // Main API Server
    {
      name: 'main-server',
      script: 'server.js',
      cwd: '.',
      env: {
        NODE_ENV: 'development',
        BACKEND_MAIN_SERVER_PORT: 5000
      },
      watch: ['server.js'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/main-server.log',
      out_file: './logs/main-server-out.log',
      error_file: './logs/main-server-error.log'
    },
 */
    // Events Service
    {
      name: 'events-service',
      script: 'index.js',
      cwd: './backend/events',
      env: {
        NODE_ENV: 'development',
        PORT: 3036
      },
      watch: ['index.js', 'routes', 'db.js'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/events-service.log',
      out_file: './logs/events-service-out.log',
      error_file: './logs/events-service-error.log'
    },

    // Heatmap Service
    {
      name: 'heatmap-service',
      script: 'index.js',
      cwd: './backend/heatmap/backend/exhibition-map-backend',
      env: {
        NODE_ENV: 'development',
        PORT: 3897
      },
      watch: ['index.js', 'routes', 'heatmap_db.js'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/heatmap-service.log',
      out_file: './logs/heatmap-service-out.log',
      error_file: './logs/heatmap-service-error.log'
    },

    // Maps Service
    {
      name: 'maps-service',
      script: 'app.js',
      cwd: './backend/Maps/backend map',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: ['app.js', 'routing.js', 'search.js'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/maps-service.log',
      out_file: './logs/maps-service-out.log',
      error_file: './logs/maps-service-error.log'
    },

    // API Gateway (Dashboard)
    {
      name: 'api-gateway',
      script: 'src/index.js',
      cwd: './backend/Organizer_Dashboard-main/backend/api-gateway',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/api-gateway.log',
      out_file: './logs/api-gateway-out.log',
      error_file: './logs/api-gateway-error.log'
    },

    // Auth Service
    {
      name: 'auth-service',
      script: 'src/index.js',
      cwd: './backend/Organizer_Dashboard-main/backend/services/auth-service',
      env: {
        NODE_ENV: 'development',
        PORT: 5004
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/auth-service.log',
      out_file: './logs/auth-service-out.log',
      error_file: './logs/auth-service-error.log'
    },

    // Organization Management Service
    {
      name: 'org-management-service',
      script: 'src/index.js',
      cwd: './backend/Organizer_Dashboard-main/backend/services/orgMng-service',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/org-management-service.log',
      out_file: './logs/org-management-service-out.log',
      error_file: './logs/org-management-service-error.log'
    },

    // Event Service (Dashboard)
    {
      name: 'event-service-dashboard',
      script: 'src/index.js',
      cwd: './backend/Organizer_Dashboard-main/backend/services/event-service',
      env: {
        NODE_ENV: 'development',
        PORT: 5002
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/event-service-dashboard.log',
      out_file: './logs/event-service-dashboard-out.log',
      error_file: './logs/event-service-dashboard-error.log'
    },

    // Building Service
    {
      name: 'building-service',
      script: 'src/index.js',
      cwd: './backend/Organizer_Dashboard-main/backend/services/building-service',
      env: {
        NODE_ENV: 'development',
        PORT: 5003
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/building-service.log',
      out_file: './logs/building-service-out.log',
      error_file: './logs/building-service-error.log'
    },

    // Alert Service
    {
      name: 'alert-service',
      script: 'src/index.js',
      cwd: './backend/Organizer_Dashboard-main/backend/services/alert-service',
      env: {
        NODE_ENV: 'development',
        PORT: 5010
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_file: './logs/alert-service.log',
      out_file: './logs/alert-service-out.log',
      error_file: './logs/alert-service-error.log'
    }
  ]
};
