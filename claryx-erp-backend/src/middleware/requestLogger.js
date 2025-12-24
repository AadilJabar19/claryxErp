const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const companyId = req.userContext?.companyId || null;
    console.log(`${req.method} ${req.url} - Company: ${companyId} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = requestLogger;