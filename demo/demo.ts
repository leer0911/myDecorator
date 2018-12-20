import { bind } from '../src/index';

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
