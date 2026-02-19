let handler;

module.exports = async (req, res) => {
  if (!handler) {
    const { bootstrap } = require('../../backend/dist/serverless');
    handler = await bootstrap();
  }
  return handler(req, res);
};
