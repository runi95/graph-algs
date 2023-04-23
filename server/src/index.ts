import {NextFunction, Request, Response} from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as express from 'express';
import * as cors from 'cors';
import * as winston from 'winston';
import {port, logLevel} from './config/config';
import {router as routes} from './routes';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({format: 'DD-MM-YYYY hh:mm:ss'}),
    winston.format.printf(
      (info) => `${info.level}\t${[info['timestamp']]}\t${info['stack'] ?? info.message}`,
    ),
  ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

logger.info('Server starting up...');

const app = express();
app.locals['logger'] = logger;

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

// Error middlewares
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Uncaught exception:', err);
  return res.status(err.status || 500).send();
});

app.listen(port, () => {
  logger.info(`Server started and running on port ${port}`);
});
