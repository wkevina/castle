import {Person, printStartMessage} from './externalModule';

printStartMessage();

var developer = new Person();
developer.sayHi();

var timeSpan = document.getElementById("timeSpan");
console.log("innerHTML = " + timeSpan.innerHTML);
timeSpan.innerHTML = '' + new Date();

console.log("innerHTML = " + timeSpan.innerHTML);
