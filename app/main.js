import {Person, printStartMessage} from './externalModule';

printStartMessage();

var developer = new Person();
developer.sayHi();

var timeSpan = document.getElementById('timeSpan');
timeSpan.innerText = new Date();
