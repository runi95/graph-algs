exports.port = process.env.PORT || 8080;
exports.logLevel = process.env.LOG_LEVEL || 'debug';
exports.templatesDir = process.env.TEMLATES_DIR || `${__dirname}/../templates`;
