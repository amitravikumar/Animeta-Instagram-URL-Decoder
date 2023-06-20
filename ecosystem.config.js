module.exports = {
  apps: [
    {
      name: "user_auth_service",
      // eslint-disable-next-line camelcase
      exec_mode: "fork",
      // eslint-disable-next-line camelcase
      ignore_watch: ["node_modules",
"logs"],
      instances: "1", // Or a number of instances
      env: {
        NODE_ENV: "development"
      },
      script: "npm run dev-mongo"
    }
  ]
};
