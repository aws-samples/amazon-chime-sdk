const exec = require('child_process').spawnSync;

const logger = {
  error: (output, info = '') =>
    console.error('\x1b[31m%s\x1b[0m', output, info), // Red
  log: output => console.log('\x1b[36m%s\x1b[0m', output), // Teal
  warn: output => console.warn('\x1b[33m%s\x1b[0m', output) // Yellow
};

const spawnOrFail = (command, args, options) => {
  options = {
    ...options,
    shell: true
  };
  const cmd = exec(command, args, options);
  if (cmd.error) {
    logger.error(`Command ${command} failed with ${cmd.error.code}`);

    process.exit(255);
  }
  const output = cmd.stdout.toString();
  logger.log(output);
  if (cmd.status !== 0) {
    logger.error(
      `Command ${command} failed with exit code ${cmd.status} signal ${cmd.signal}`
    );
    logger.log(cmd.stderr.toString());
    process.exit(cmd.status);
  }
  return output;
};

module.exports = {
  spawnOrFail,
  logger,
};
