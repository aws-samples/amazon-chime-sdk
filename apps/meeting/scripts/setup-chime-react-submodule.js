#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

function spawnOrFail(command, args, options, printOutput = true) {
  options = {
    ...options,
    shell: true
  };
  const cmd = spawnSync(command, args, options);

  if (cmd.error) {
    console.log(`Command ${command} failed with ${cmd.error.code}`);
    process.exit(255);
  }
  const output = cmd.output.toString();
  if (printOutput) {
    console.log(output);
  }
  if (cmd.status !== 0) {
    console.log(`Command ${command} failed with exit code ${cmd.status} signal ${cmd.signal}`);
    console.log(cmd.stderr.toString());
    process.exit(cmd.status);
  }
  return output;
}

const pjson = require('../package.json');

// No need to setup if we do not depend on submodule
if (pjson.dependencies['amazon-chime-sdk-component-library-react'] !== 'file:../../amazon-chime-sdk-component-library-react') {
  return;
}

process.chdir(path.join(__dirname, '../../../amazon-chime-sdk-component-library-react'));

if (!fs.existsSync('node_modules')) {
  console.log('Setup amazon-chime-sdk-component-library-react submodule')
  spawnOrFail('git', [ 'submodule init']);
  spawnOrFail('git', [ 'submodule update']);
  spawnOrFail('npm', [ 'install']);
}

console.log('Building amazon-chime-sdk-component-library-react submodule');
spawnOrFail('npm', [ 'run build']);


