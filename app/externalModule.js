export class Person {
  constructor(fname='john', lname='Doe') {
    this.fname = fname;
    this.lname = lname;
  }

  sayHi() {
    console.log(`Hello from ${this.fname} ${this.lname}`);
  }
}

export function printStartMessage() {
  console.log(`Application started on ${new Date()} successfully!`);
}
