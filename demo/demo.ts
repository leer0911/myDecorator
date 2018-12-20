// import { bind } from '../src/index';

import { DecoratorFactory, DecoratorConfig } from '../src/index';

const bind = DecoratorFactory.createDecorator(new DecoratorConfig(()=>{
  console.log('a');
},()=>{}));

class MyClass {
  @bind()
  bound() {
    console.log(this);
    return this;
  }

  unbound() {
    console.log(this);
    return this;
  }
}

const myClass = new MyClass();

myClass.bound.call(null); // => myClass {}
myClass.unbound.call(null); // => null
