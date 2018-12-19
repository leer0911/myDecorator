import { autobind } from '../src/core-decorators';

class Parent {
  p() {}
}
class Child extends Parent {
  @autobind
  c() {
    console.log(this);
  }
}

// const c = new Child();

// const cc = c.a;
// cc();

// class TestGet {
//   getName() {
//     console.log('调用方法', this);
//   }
// }

// const test = new TestGet();

// // const { value } = Object.getOwnPropertyDescriptor(test, 'getName');
// const obj = {
//   getName() {
//     console.log('调用方法', this);
//   }
// };

// console.log(Object.getOwnPropertyDescriptors(test));
// console.log(Object.getOwnPropertyDescriptors(obj));

// const { getName } = test;

// getName();
// test.getName();
