// PM2 进程管理配置
module.exports = {
  apps: [
    {
      name: 'cim-dev',
      script: 'src/server.ts',
      interpreter: 'node',
      // tsx 作为 loader 运行 TypeScript
      node_args: '--import tsx',
      cwd: __dirname,
      env: {
        PORT: 5000,
        NODE_ENV: 'development',
      },
      // 文件监听（开发模式热重载）
      watch: ['src'],
      ignore_watch: ['node_modules', '.next', 'data', 'dist'],
      // 日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      // 自动重启
      max_restarts: 10,
      restart_delay: 2000,
      // 内存限制
      max_memory_restart: '500M',
    },
    {
      name: 'cim-prod',
      script: 'dist/server.js',
      cwd: __dirname,
      env: {
        PORT: 5000,
        NODE_ENV: 'production',
      },
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      max_restarts: 5,
      restart_delay: 5000,
      max_memory_restart: '1G',
    },
  ],
};
