const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const {port, logLevel, templatesDir} = require('./config/config');
const routes = require('./routes');

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({format: 'DD-MM-YYYY hh:mm:ss'}),
      winston.format.printf(
          (info) =>
            `${info.level}\t${[info.timestamp]}\t${info.stack ?? info.message}`,
      ),
  ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

logger.info('Server starting up...');


const app = express();
app.locals.logger = logger;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
        {
          stream: {
            write: (text) => {
              logger.info(text.trimEnd());
            },
          },
        }),
);

// Routes
app.use('/api', routes);
app.use('/templates', express.static(templatesDir));

// Error middlewares
app.use((err, _req, res, _next) => {
  logger.error('Uncaught exception:', err);
  return res.status(err.status || 500).send();
});

app.listen(port, () => {
  logger.info(`Server started and running on port ${port}`);
});
