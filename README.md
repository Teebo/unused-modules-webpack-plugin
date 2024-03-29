# UnusedModulesWebpackPlugin
 
A Webpack plugin to find and report unused modules/files.
 
## Installation
 
```
npm install --save-dev unused-modules-webpack-plugin
```
 
# Usage example
 
Import the plugin and include the instance in your plugins array of your Webpack config file
 
```javascript
... 
const UnusedModulesWebpackPlugin = require('unused-modules-webpack-plugin').UnusedModulesWebpackPlugin;
...
 
plugins: [
      new UnusedModulesWebpackPlugin({
      patterns: [
        "src/**/**.js",
        "!src/**/**.css",
      ],
      globOptions: { ignore: `node_modules/**/*` },
    }),
]
... 
```

Refer to the NPM package (glob-all)[https://www.npmjs.com/package/glob-all] for details on the **globOptions** that can be passed to your new instance.


# Note that the plugin's output will be printed before Webpack's emit console output
