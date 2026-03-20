// Mock process for axios
global.process = {
  ...global.process,
  version: '16.0.0',
  browser: true,
  env: {
    NODE_ENV: 'development'
  }
};