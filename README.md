# Decorators 低侵入性探索

虽然本文的初衷是讲 ES7 中的装饰器，但笔者更喜欢在探索的过程中加深对前端基础知识的理解。本着一颗刨根问底儿的心，分享内容会尽可能多地将一些关联知识串联起来讲解。

乍一看可能会有点乱，但却是笔者学习一个新知识的完整路径。 一种带着关键词去学习的方法，比较笨，读者选读即可，取精华去糟粕。

另外，这个[仓库](https://github.com/leer0911/myDecorator) 是专门用来记录 **Decorators 低侵入性探索** 收获的知识。后续可能会结合 mobx 源码、以及在 React 中实际应用场景来深入。

前端知识广度无边无际，深度深不可测，笔者记性不好，类似的仓库有:

- [XHR](https://github.com/leer0911/myXHR)
- [CSS](https://github.com/leer0911/myCss)
- [Promise](https://github.com/leer0911/myPromise)

## 概览

[Decorators](https://github.com/wycats/javascript-decorators) 属于 ES7， 目前处于[提案阶段](https://github.com/tc39/proposals)，可通过 `babel` 或 `TS` 编译使用。

本文属于探索型，主要分为三部分：

- Decorators 基础知识

- Babel 与 TypeScript 支持

- 常见应用场景

## 基础知识

> 装饰器 (Decorators) 让你可以在设计时对类和类的属性进行“注解”和修改。

`Decorators` 一般接受三个参数：

- 目标对象 target

- 属性名称 key

- 描述对象 descriptor

可选地返回一个描述对象来安装到目标对象上，其的函数签名为

`function(target, key?, descriptor?)`。

### Object.defineProperty

`Decorators` 的本质是利用了 ES5 的 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 方法，这个方法着实改变了很多，比如 vue 响应式数据的实现方法，当然还有更为迷人 `proxy`，是不是发现，很多框架背后的靠山都离不开这些底层规范的支持。

下面来简单了解下这个方法：

> `Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。

`Object.defineProperty(obj, prop, descriptor)`

- `obj` 要在其上定义属性的对象。

- `prop` 要定义或修改的属性的名称。

- `descriptor` 将被定义或修改的属性描述符。

- `返回值` 被传递给函数的对象。

其中 `descriptor` 可通过 [`Object.getOwnPropertyDescriptor()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) 方法获得。

### `Object.getOwnPropertyDescriptor`

> `Object.getOwnPropertyDescriptor()` 方法返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性）

- `obj` 需要查找的目标对象

- `prop` 目标对象内属性名称（String 类型）

- `返回值` 如果指定的属性存在于对象上，则返回其属性描述符对象（property descriptor），否则返回 `undefined`。

### Descriptor

> 一个属性描述符是一个记录，由下面属性当中的某些组成的：

- `value` 该属性的值(仅针对数据属性描述符有效)

- `writable` 当且仅当属性的值可以被改变时为 `true`。(仅针对数据属性描述有效)

- `configurable` 当且仅当指定对象的属性描述可以被改变或者属性可被删除时，为 `true`。

- `enumerable` 当且仅当指定对象的属性可以被枚举出时，为 `true`。

- `get` 获取该属性的访问器函数（`getter`）。如果没有访问器， 该值为 `undefined`。(仅针对包含访问器或设置器的属性描述有效)

- `set` 获取该属性的设置器函数（`setter`）。 如果没有设置器， 该值为 `undefined`。(仅针对包含访问器或设置器的属性描述有效)

各式的装饰器一般都是基于修改上述属性来实现，比如 `writable`可用于设置 `@readonly`。更多的功能，可参考 `lodash-decorator`

### 基础知识小结

现在我们对 Decorators 方法 `function(target, key?, descriptor?)` 混了个脸熟，同时知道了`Object.defineProperty` 和 `Descriptor` 与 Decorators 的联系。

但是，目前浏览器对 Es7 这一特性支持 并不友好。Decorators 目前还只是语法糖，尝鲜可通过 babel 、TypeScript。

接下来就来了解这一部分的内容。

## babel 与 Decorators

很多构建工具都离不开 babel，比如笔者用于快速跑 demo 的 parcel。虽然很多时候我们并不需要关心这些构建后的代码，但笔者建议有时间还是多了解下，毕竟前端打包后出现的 bug 还是很常见的。

回到装饰器，现阶段官方说有 2 种装饰器，但从实际使用上可分为 4 种，分别是：

- “**类装饰器**” 作用于 `class`。

- “**属性装饰器**” 作用于属性上的，这需要配合另一个的类属性语法提案，或者作用于对象字面量。

- “**方法装饰器**” 作用于方法上。

- “**访问器装饰器**” 作用于 `getter` 或 `setter` 上的。

下面我们通过 babel 命令行，来感受一下各装饰器：

### babel 配置

先简单介绍下 babel 的用法：

1. 全局安装 `babel`

```bash
npm i -g babel
```

2. 配置 `.babelrc`

```json
{
  "presets": [["es2015", { "modules": false }]],
  "plugins": ["transform-decorators-legacy", "transform-class-properties"],
  "env": {
    "development": {
      "plugins": ["transform-es2015-modules-commonjs"]
    }
  }
}
```

3. 在 `package.json` 配置 npm script

```json
{
  "babel": "babel ./demo/demo.js -w --out-dir dist"
}
```

该命令的意思是：监听 `demo` 目录下 `demo.js` 文件，并将编译结果输出到 `dist` 目录

下面列出各装饰器在 `babel` 编译后对应的输出结果。

### “类装饰器”

![](img/class.png)

从编译后的结果可以看到，`autobind` 作为装饰器只接受了一个参数，也就是类本身(构造函数)。

```js
class MyClass = {}
MyClass = autobind(MyClass) || MyClass
```

### “方法装饰器”

![](img/pro.png)

bebel 对于`方法装饰器`的处理会比较特别，下面看下核心处理：

```js
var _class;

// 1、首先，初始化一个 class
var initClass = (_class = (function() {
  // ... 类定义
})());

// 2、通过 `_applyDecoratedDescriptor` 方法使用传入的装饰器对 `_class.prototype` 中的方法进行装饰处理。
var Decorator = _applyDecoratedDescriptor(
  _class.prototype,
  'getName',
  [autobind],
  Object.getOwnPropertyDescriptor(_class.prototype, 'getName'),
  _class.prototype
);

// 3、利用逗号操作符的作用，返回装饰完的 `_class`
var MyClass = (initClass, Decorator, _class);
```

后续会对 `_applyDecoratedDescriptor` 方法进一步讲解。

> **逗号操作符** 对它的每个操作数求值（从左到右），并返回最后一个操作数的值。

### “访问器装饰器”

![](img/get.png)

“访问器装饰器” 的处理方式与 “方法装饰器”类似。

### “属性装饰器”

![](img/classpro.png)

区别在于传入的第三个参数 `Descriptor` 并不是由 `Object.getOwnPropertyDescriptor(_class.prototype, 'getName')` 返回的，并且多了一个 `Descriptor` 上并不存在的 `initializer` 属性供 `_applyDecoratedDescriptor` 方法使用。

```js
_applyDecoratedDescriptor(
  _class.prototype,
  'getName',
  [autobind],
  // Object.getOwnPropertyDescriptor(_class.prototype, 'getName'),
  {
    enumerable: true,
    initializer: function initializer() {
      return function() {};
    }
  }
))
```

接下来就让我们来看一下 `_applyDecoratedDescriptor` 都做了哪些事

### `_applyDecoratedDescriptor`

`_applyDecoratedDescriptor` 其实是对 `decorator` 的一个封装，用于处理多种情况。其接受的参数跟 `decorator` 大体一致。

- `target` 目标对象

- `property` 属性名称

- `descriptor` 属性描述对象

- `decorators` 装饰器函数 (数组，表示可传入多个装饰器)

- `context` 上下文

- `返回值` 属性描述对象

```js
function _applyDecoratedDescriptor(
  target,
  property,
  decorators,
  descriptor,
  context
) {
  // 1、通过传入参数 `descriptor` 初始化最终导出的 `属性描述对象`
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function(key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  // 2、存在 `value` 或者 class 初始化属性 则将 `writable` 设置为 `true`
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  // 3、处理传入的 decorator 函数
  // 其中 `reverse` 保证了，当同一个方法有多个装饰器，会由内向外执行。
  desc = decorators
    .slice()
    .reverse()
    .reduce(function(desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

  // 看 babel 编译后的代码，当 `initializer` 不为 `undefined` 时，并不会传入 `context`
  // 笔者看不懂! ??? 这是一个永远不会执行的逻辑... 难道改走 `_initDefineProp` 逻辑了?
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  // 4. 使用 Object.defineProperty 对 `target` 对象的 `property` 属性赋值为 `desc`
  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}
```

> **void 运算符** 对给定的表达式进行求值，然后返回 `undefined`。

现在我们对 `Descorators` 有了大致的了解，接下来看下 **Descorators 基于 babel 编译下的装饰器**

### 自动绑定 `this`

我们先来看一个关于 `this` 的问题

### `this` 的指向问题

```js
class Person {
  getPerson() {
    return this;
  }
}

let person = new Person();
const { getPerson } = person;

getPerson() === person; // false
person.getPerson() === person; // true
```

这段代码中，`getPerson` 和 `person.getPerson` 指向同一个函数且返回 `this` ，但它们的执行结果却不一样。

`this` 指的是函数运行时所在的环境：

- `getPerson()` 运行在全局环境，所以 `this` 指向全局环境

- `person.getPerson` 运行在 `person` 环境，所以 `this` 指向 `person`

关于 `this` 的原理可以参考 [这篇](http://www.ruanyifeng.com/blog/2018/06/javascript-this.html)：

在本例中，`getPerson()` 是一个函数，JavaScript 引擎会将函数单独保存在内存中，然后再将函数的地址赋值给 `getPerson` 属性的 `value` 属性 ([descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor))

![](img/this.png)

由于函数单独存在于内存中，所以它可以在不同的环境 (上下文) 执行。

来看个例子：

```js
// 注意，这里都是用 var 声明变量

var name = 'globalName';

var fn = function() {
  console.log(this.name);
  return this.name;
};

var person = {
  getPerson: fn,
  name: 'personName'
};

// 单独执行
var ref = person.getPerson;
ref();

// or
fn();

// person 环境指执行
person.getPerson();
```

函数可以在不同的运行环境 ([context](http://flippinawesome.org/2013/08/26/understanding-scope-and-context-in-javascript/))，所以需要一种机制，能够在函数体内部获得当前的运行环境。

这里 `this` 的设计目的就是在函数体内部，指代函数当前的运行环境。

例子中，`fn()` 和 `ref()` 的运行环境都是 **全局运行环境** 而 `person.getPerson()` 的运行环境是 `person`，因此得到了不同的 `this`

解决 `this` 指向的方法有很多种，比如函数的原型方法

- [bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
- [call](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [apply](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions) ( 建议结合 [函数表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/function) 一起了解 )

通过上面学习到的知识，接着来讲解 `Decorator` 中如何实现 `autobind` 给函数或类自动绑定 `this`

### autobind 实现逻辑

一、 首先来看下 **如何给类的方法自动绑定 `this`**：

1. 开始前，先来运行下面这段代码：

```js
var obj = {
  fn: function() {
    console.log('执行时的', this);
  }
};

var fn = Object.getOwnPropertyDescriptor(obj, 'fn').value;

Object.defineProperty(obj, 'fn', {
  get() {
    console.log('get 访问器里的', this);
    return fn;
  }
});

var fn = obj.fn;
fn();
obj.fn();
```

![](img/get_this.png)

2. 可以得到的一个结论：`get(){}` 访问器属性里面的 `this` 始终指向 `obj` 这个对象。

3. 如果简化逻辑，也就是不考虑其他特殊情况下，`autobindMethod` 应该是这样的：

```js
function autobindMethod(target, key, { value: fn, configurable, enumerable }) {
  return {
    configurable,
    enumerable,
    get() {
      const boundFn = fn.bind(this);
      defineProperty(this, key, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: boundFn
      });
      return boundFn;
    },
    set: createDefaultSetter(key)
  };
}
```

> **bind()** 方法创建一个**新的函数**， 当这个新函数被调用时 this 键值为其提供的值，其参数列表前几项值为创建时指定的参数序列。

有了 `autobind` 这个装饰器，`getName` 方法的 `this` 就始终指向实例对象本身了。

```js
class TestGet {
  @autobind
  getName() {
    console.log(this);
  }
}
```

二、接着来看下类的 `autobind` 实现

对类绑定 `this` 其实就是为了批量给类的实例方法绑定 `this` 所以只要获取所有实例方法，再调用 `autobindMethod` 即可。

```js
function autobindClass(klass) {
  const descs = getOwnPropertyDescriptors(klass.prototype);
  const keys = getOwnKeys(descs);

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    const desc = descs[key];

    if (typeof desc.value !== 'function' || key === 'constructor') {
      continue;
    }

    defineProperty(
      klass.prototype,
      key,
      autobindMethod(klass.prototype, key, desc)
    );
  }
}
```

以上实现考虑的是 Babel 编译后的文件，除了 Babel ，TypeScript 也支持编译 Decorators。

因此就需要一个更为通用的 Decorators 包装函数，接下来让我们一起实现它。

## TypeScript 与 Decorators

先来一起看下 TypeScript 编译后的结果。

![](img/ts.png)

从上图可以看出，TypeScript 对 Decorator 编译的结果跟 Babel 略微不同，TypeScript 对属性和方法没有过多的处理，唯一的区别可能就是在对类的处理上，传入的 `target` 为类本身，而不是 `Prototype`。

### 通用 Decorator

无论是用什么编译器生成的代码，最终参数还是离不开 `target, name, descriptor`。另外，无论怎么包装，最终也是为了提供一个能够新增或者修改 `descriptor` 某个属性的函数，只要是对属性的修改，就必然离不开 `Object.defineProperty` 。

> 有时候，我们难以读懂某段代码，可能只是因为没有进入这段代码的真实上下文（应用场景）。如果是按需求来开发某个 Decorator,事情就会变得简单。

通用 Decorator，意味着将要用于生成具有共有特征且用于不同场景的装饰器，通常最容易让人想到就是工厂模式。

我们来看下 `lodash-decorators` 中的实现：

```ts
export class InternalDecoratorFactory {
  createDecorator(config: DecoratorConfig): GenericDecorator {
    // 基础装饰器
  }

  createInstanceDecorator(config: DecoratorConfig): GenericDecorator {
    // 生成用于实例的装饰器
  }

  private _isApplicable(
    context: InstanceChainContext,
    config: DecoratorConfig
  ): boolean {
    // 是否可调用
  }

  private _resolveDescriptor(
    target: Object,
    name: string,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor {
    // 获取 Descriptor 的通用方法。
  }
}
```

这里用 TypeScript 的好处在于，类本身具备某种结构。也就是可供类型描述使用。另外，在看源码过程中，TypeScript 的类型有助于快速理解作者意图。

比如单看上面代码，我们就可以知道 `createDecorator` 和 `createInstanceDecorator` 都接收类型为 `DecoratorConfig` 的参数，以及返回都是通用的 Decorator `GenericDecorator`。

那我们先来看下：

```ts
export interface DecoratorConfigOptions {
  bound?: boolean;
  setter?: boolean;
  getter?: boolean;
  property?: boolean;
  method?: boolean;
  optionalParams?: boolean; // 是否使用自定义参数
}

export class DecoratorConfig {
  constructor(
    public readonly execute: Function, // 处理函数，如传入 debounce 函数
    public readonly applicator: Applicator, // 根据处理函数不同，选用不同的函数调用程序。
    public readonly options: DecoratorConfigOptions = {}
  ) {}
}
```

关键的参数有：

- `execute` 装饰函数的核心处理函数。
- `applicator` 主要作用是用于配置参数及函数的调用。
- `options` 额外的配置选项，如是否是属性，是否是方法，是否使用自定义参数等。

这里的 Applicator 属于函数调用中公共部分的抽离：

```ts
export interface ApplicateOptions {
  config: DecoratorConfig;
  target: any;
  value: any;
  args: any[];
  instance?: Object;
}

export abstract class Applicator {
  abstract apply(options: ApplicateOptions): any;
}
```

一个通用的 Decorator 的核心部分差不多就这些了，但由于笔者实际应用 Decorators 的地方不多，对于 `lodash-decorators` 源码中为什么有 `createDecorator` 和 `createInstanceDecorator` 两种生成方法，以及为什么要引入 `weekMap` 的原因，一时也给不了非常准确的答案。`createInstanceDecorator` 也许是出于原型链考虑？因为实例，才能访问原型链继承后得到的方法，以后有机会再单独深入。

**希望有这方面研究的读者可以不吝赐教，笔者不胜感激**。

### 常见应用场景

结合 `lodash`,关注点分离了。实现各种 decorators 在代码实现上就变得非常简单。比如，前端可能会经常用到的**函数节流**，**函数防抖**，**delay**。

```ts
import debounce = require('lodash/debounce');
import { PreValueApplicator } from './applicators';

const decorator = DecoratorFactory.createInstanceDecorator(
  new DecoratorConfig(debounce, new PreValueApplicator(), { setter: true })
);

export function Debounce(
  wait?: number,
  options?: DebounceOptions
): LodashDecorator {
  return decorator(wait, options);
}
```

通过调用 `DecoratorFactory` 生成通用的 decorator，实现各种装饰器功能就只需要像上面一样组织代码即可。

另外像 `Mixin` 这种看似组合优于继承的用法是一种对类的装饰，可以这么去实现：

```ts
import assign = require('lodash/assign');

export function Mixin(...srcs: Object[]): ClassDecorator {
  return ((target: Function) => {
    assign(target.prototype, ...srcs);
    return target;
  }) as any;
}
```

更多的功能，笔者就不再过多赘述。靠有心的读者去举一反三了，或者直接看 `lodash-decorators` 源码。**毕竟我也是看它们源码来学习的。**

## 总结

> 这么草率的结束，也许意味着还有更多学习空间。

`Decorators` 涉及的知识并不难，关键在于如何巧妙运用。初期没经验，可以学习笔者看些周边库，比如 `lodash-decorators`。所谓的低侵入性，也只是视觉感官上的，不过确实多少能提高代码的可读性。

最后，前端路上，多用 【闻道有先后，术业有专攻】安慰自己，学习永无止境。 感谢阅读，愿君多采撷！

## 参考

- [ECMAScript proposals](https://github.com/tc39/proposals)
- [lodash-decorators](https://github.com/steelsojka/lodash-decorators#readme)
- [core-decorators](https://github.com/jayphelps/core-decorators)
