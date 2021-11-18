#!/usr/bin/env node

/**
 * This script clones and installs the latest code from amazon-chime-sdk-component-library-react
 * GitHub repository when in meeting-dev branch.
 */

const fs = require('fs');
const path = require('path');
const { logger, spawnOrFail } = require('./utilities');
const rimraf = require('rimraf');
 
const currentBranch = spawnOrFail('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (currentBranch === 'main') {
  logger.log(`current branch is ${currentBranch}, using latest react library from NPM`);
  return;
}

if (currentBranch === 'meeting-dev') {
  logger.log(`current branch is ${currentBranch}, using react library from GitHub`);
  const package = 'amazon-chime-sdk-component-library-react';
  const dir = `${package}-github`;
  const packageGitUrl = 'https://github.com/aws/amazon-chime-sdk-component-library-react.git';
  
  rimraf.sync(dir);
  if (!fs.existsSync(dir)) {
    logger.log(`Creating a temp directory ${dir}`);
    fs.mkdirSync(dir);
  }
  
  process.chdir(path.join(__dirname, `../${dir}`));
  logger.log(`Cloning ${package} to update the existing installation.`);
  spawnOrFail('git', [`clone ${packageGitUrl}`]);
  
  process.chdir(path.join(__dirname, `../${dir}/${package}`));
  
  logger.log(`Running npm install in cloned ${package}`);
  spawnOrFail('npm', ['install']);
  
  logger.log(`Building ${package}`);
  spawnOrFail('npm', ['run build']);
  
  logger.log(`Packing ${package}`);
  const tarball = spawnOrFail('npm', ['pack --pack-destination ../']).replace('\n', '');
  
  logger.log(`Installing new cloned ${package} in the demo`)
  process.chdir(path.join(__dirname, '..'));
  spawnOrFail('npm', [`install ./${dir}/${tarball}`]);
}
