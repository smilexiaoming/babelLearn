# babel理论知识
  ## 核心库 @babel/core
    babel核心库，使用babel必须使用它  
  ## CLI命令行工具 @babel/cli
    babel 提供的命令行工具，主要是提供 babel 这个命令  

    ```shell
        npm install --save-dev @babel/core @babel/cli
    ```
    ```javescript
        //package.json
        "compiler": "babel src/index.js --out-dir dist --watch"
    ```
    此时执行 babel 命令，代码不会有任何变化，因为还没给他装插件（plugin），所有没有任何动作，接下来安装插件
  ## 插件
    Babel 构建在插件之上，使用现有的或者自己编写的插件可以组成一个转换通道，Babel 的插件分为两种: 语法插件和转换插件。
  ## 语法插件
    这些插件只允许 Babel 解析（parse） 特定类型的语法（不是转换），可以在 AST 转换时使用，以支持解析新语法
  ## 转换插件
    转换插件会启用相应的语法插件(因此不需要同时指定这两种插件)，这点很容易理解，如果不启用相应的语法插件，意味着无法解析，连解析都不能解析，又何谈转换呢？
  ## 插件使用
    如果插件发布在 npm 上，可以直接填写插件的名称， Babel 会自动检查它是否已经被安装在 node_modules 目录下，在项目目录下新建 .babelrc 文件 (下文会具体介绍配置文件)，配置如下：
    ```javascript
        //.babelrc
        {
            "plugins": ["@babel/plugin-transform-arrow-functions"]
        }
    ```
    重新编译，代码已经转换: 
    ```javascript
        const fn = function () {
            console.log('1');
        };
    ```
    现在，我们仅支持转换箭头函数，如果想将其它的新的JS特性转换成低版本，需要使用其它对应的 plugin 。如果我们一个个配置的话，会非常繁琐，因为你可能需要配置几十个插件，这显然非常不便，那么有没有什么办法可以简化这个配置呢？
  ## 预设
    通过使用或创建一个 preset 即可轻松使用一组插件,官方 Preset:
    > @babel/preset-env
    > @babel/preset-flow
    > @babel/preset-react
    > @babel/preset-typescript
    __注__: 从 Babel v7 开始，所有针对标准提案阶段的功能所编写的预设(stage preset)都已被弃用，官方已经移除了 @babel/preset-stage-x。

  ## @babel/preset-env
  @babel/preset-env 主要作用是对我们所使用的并且目标浏览器中缺失的功能进行代码转换和加载 polyfill，在不进行任何配置的情况下，@babel/preset-env 所包含的插件将支持所有最新的JS特性(ES2015,ES2016等，不包含 stage 阶段)，将其转换成ES5代码。例如，如果你的代码中使用了可选链(目前，仍在 stage 阶段)，那么只配置 @babel/preset-env，转换时会抛出错误，需要另外安装相应的插件。
   ```javascript
    //.babelrc
    {
      "presets": ["@babel/preset-env"]
    }
  ```
  需要说明的是，@babel/preset-env 会根据你配置的目标环境，生成插件列表来编译。对于基于浏览器或 Electron 的项目，官方推荐使用 .browserslistrc 文件来指定目标环境。默认情况下，如果你没有在 Babel 配置文件中(如 .babelrc)设置 targets 或 ignoreBrowserslistConfig，@babel/preset-env 会使用 browserslist 配置源。

  如果你不是要兼容所有的浏览器和环境，推荐你指定目标环境，这样你的编译代码能够保持最小。
  例如，仅包括浏览器市场份额超过0.25％的用户所需的 polyfill 和代码转换（忽略没有安全更新的浏览器，如 IE10 和 BlackBerry）:
  ```javascript
    //.browserslistrc
    > 0.25%
    not dead
  ```
  这个编译出来的代码在低版本浏览器中使用的话，显然是有问题的，因为低版本浏览器中没有 Promise 构造函数。
这是为什么呢？因为语法转换只是将高版本的语法转换成低版本的，但是新的内置函数、实例方法无法转换。这时，就需要使用 polyfill 上场了，顾名思义，polyfill的中文意思是垫片，所谓垫片就是垫平不同浏览器或者不同环境下的差异，让新的内置函数、实例方法等在低版本浏览器中也可以使用。

  ## @babel/polyfill
  @babel/polyfill 模块包括 core-js 和一个自定义的 regenerator runtime 模块，可以模拟完整的 ES2015+ 环境（不包含第4阶段前的提议）。
这意味着可以使用诸如 Promise 和 WeakMap 之类的新的内置组件、 Array.from 或 Object.assign 之类的静态方法、Array.prototype.includes 之类的实例方法以及生成器函数(前提是使用了 @babel/plugin-transform-regenerator 插件)。为了添加这些功能，polyfill 将添加到全局范围和类似 String 这样的内置原型中(会对全局环境造成污染，后面我们会介绍不污染全局环境的方法)。
__补充说明__ (2020/01/07)：V7.4.0 版本开始，@babel/polyfill 已经被废弃(前端发展日新月异)，需单独安装 core-js 和 regenerator-runtime 模块。
```javascript
    //.src/index
    import '@babel/polyfill'
    ...
  ```
现在，我们的代码不管在低版本还是高版本浏览器(或node环境)中都能正常运行了。不过，很多时候，我们未必需要完整的 @babel/polyfill，这会导致我们最终构建出的包的体积增大，@babel/polyfill的包大小为89K (当前 @babel/polyfill 版本为 7.7.0)。
我们更期望的是，如果我使用了某个新特性，再引入对应的 polyfill，避免引入无用的代码。
值得庆幸的是， Babel 已经考虑到了这一点。
@babel/preset-env 提供了一个 useBuiltIns 参数，设置值为 usage 时，就只会包含代码需要的 polyfill 。有一点需要注意：配置此参数的值为 usage ，必须要同时设置 corejs (如果不设置，会给出警告，默认使用的是"corejs": 2) ，注意: 这里仍然需要安装 @babel/polyfill(当前 @babel/polyfill 版本默认会安装 "corejs": 2):
首先说一下使用 core-js@3 的原因，core-js@2 分支中已经不会再添加新特性，新特性都会添加到 core-js@3。例如你使用了 Array.prototype.flat()，如果你使用的是 core-js@2，那么其不包含此新特性。为了可以使用更多的新特性，建议大家使用 core-js@3。
```shell
    npm install --save core-js@3
  ```

   ```javascript
   //.babelrcconst 
   presets = [    [        "@babel/env",        {               "useBuiltIns": "usage",            "corejs": 3        }    ]]
  ```
  Babel 会使用很小的辅助函数来实现类似 _createClass 等公共方法。默认情况下，它将被添加(inject)到需要它的每个文件中。此时，多个文件使用 class 构造对象，就会多次引用 _createClass 等公共方法，增加打包大小，
  所以@babel/plugin-transform-runtime 插件大显身手的时候了

## @babel/plugin-transform-runtime
@babel/plugin-transform-runtime 是一个可以重复使用 Babel 注入的帮助程序，以节省代码大小的插件。
另外，@babel/plugin-transform-runtime 需要和 @babel/runtime 配合使用。
首先安装依赖，@babel/plugin-transform-runtime 通常仅在开发时使用，但是运行时最终代码需要依赖 @babel/runtime，所以 @babel/runtime 必须要作为生产依赖被安装，

   ```javascript
   //.babelrc
   {    
     "presets": [   
      ["@babel/preset-env",{
       "useBuiltIns": "usage",
        "corejs": 3
       }
      ]
    ],
    "plugins": [ ["@babel/plugin-transform-runtime"]]}
  ```
  对于帮助函数将引用@babel/runtime中的包，但是Promise依旧会全局增加，污染全局。
  如果我们希望 @babel/plugin-transform-runtime 不仅仅处理帮助函数，同时也能加载 polyfill 的话，我们需要给 @babel/plugin-transform-runtime 增加配置信息

  首先新增依赖 @babel/runtime-corejs3
   ```javascript
   //.babelrc
   {    
     "presets": [   
      ["@babel/preset-env"]
    ],
    "plugins": [ ["@babel/plugin-transform-runtime",{
      "corejs": 3
    }]]}
  ```
  修改配置文件如下(移除了 @babel/preset-env 的 useBuiltIns 的配置，不然不就重复了嘛嘛嘛

## 插件/预设补充知识
插件在 Presets 前运行。
插件顺序从前往后排列。
Preset 顺序是颠倒的（从后往前）。
