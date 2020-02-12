import { Aoba, Config, Logger } from './structures';
import { existsSync } from 'fs';
import * as utils from './util';

const logger = new Logger();
if (!existsSync(utils.getArbitrayPath('config.json'))) {
  logger.warn(`Missing configuration file (path=${utils.getArbitrayPath('config.json')})`);
  process.exit(1);
}

const config: Config = require('./config.json');
const bot = new Aoba(config);

logger.info('Now bootstrapping...');
bot.start()
  .then(() => logger.info('Bootstrapped successfully!'))
  .catch(ex => logger.error('Unable to bootstrap:', ex));

process.on('SIGINT', async () => {
  logger.warn('Disposing bot instance...');
  await bot.dispose();

  process.exit(0);
});

process.on('uncaughtException', ex => logger.error('Received the "uncaughtException" error for', ex));
process.on('unhandledRejection', reason => logger.error('Received the "unhandledRejection" error for', reason || new Error('No reason was provided')));