const path = require("path");
const nativeGlobAll = require("glob-all");
const promisify = require("util.promisify");
const colors = require('colors/safe');

const globAll = promisify(nativeGlobAll);

function globOptionsWith(compiler, globOptions) {
  return {
    cwd: compiler.context,
    ...globOptions
  };
}

function getFileDepsMap(compilation) {
  const fileDepsBy = [...compilation.fileDependencies].reduce(
    (acc, usedFilepath) => {
      acc[usedFilepath] = true;
      return acc;
    },
    {}
  );

  const { assets } = compilation;

  Object.keys(assets).forEach(assetRelpath => {
    const existsAt = assets[assetRelpath].existsAt;

    fileDepsBy[existsAt] = true;
  });

  return fileDepsBy;
}

async function applyDone(compiler, compilation, plugin) {
  try {
    const globOptions = globOptionsWith(compiler, plugin.globOptions);
    const fileDepsMap = getFileDepsMap(compilation);
    const files = await globAll(plugin.options.patterns || globOptions);
    const unusedModules = files.filter(file => !fileDepsMap[path.join(globOptions.cwd, file)]);

    if (unusedModules.length !== 0) {
      console.log(`\n${colors.bold.white(`${colors.bgCyan('UnusedModulesWebpackPlugin')}`)}`);
      console.log(`\n${colors.bold.red(`Found ${unusedModules.length} unused modules`)}`);
      console.log(`\n${colors.yellow(unusedModules.join(`\n`))}\n`);

      throw new Error(`${colors.bold.red(`Found ${unusedModules.length} unused modules`)}`); 
    }
  } catch (error) {
    if (plugin.options.failOnUnused && compilation.bail) {
      throw error;
    }
  }
}

class UnusedModulesWebpackPlugin {
  constructor(options = { failOnUnused: false }) {
    this.options = {
      ...options,
      patterns: options.patterns || [`**/*.*`],
      failOnUnused: options.failOnUnused
    };

    this.globOptions = {
      ignore: `node_modules/**/*`,
      ...options.globOptions
    };
  }

  apply(compiler) {
    const onDone = (stats, done) => {
      applyDone(compiler, stats.compilation, this).then(done, done);
    };

    compiler.hooks.done.tapAsync("UnusedModulesWebpackPlugin", onDone);
  }
}

module.exports.UnusedModulesWebpackPlugin = UnusedModulesWebpackPlugin;