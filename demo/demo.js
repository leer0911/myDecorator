"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var index_1 = require("../src/index");
var MyClass = /** @class */ (function () {
    function MyClass() {
    }
    MyClass.prototype.bound = function () {
        console.log(this);
        return this;
    };
    MyClass.prototype.unbound = function () {
        console.log(this);
        return this;
    };
    __decorate([
        index_1.bind()
    ], MyClass.prototype, "bound");
    return MyClass;
}());
var myClass = new MyClass();
myClass.bound.call(null); // => myClass {}
myClass.unbound.call(null); // => null
