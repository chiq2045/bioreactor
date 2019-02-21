function Animal(name) {
  this.name = name;
  this.size = 0;
}

Animal.prototype.printName = function() {
  console.log(this.name);
}

let tiger = new Animal('Tiger');
let bear = new Animal('Bear');

function changeSize(animal, newSize) {
  animal.size = newSize;
}

console.log(tiger.size);
changeSize(tiger, 300);
changeSize(bear, 600);

function showSize(animal) {
  console.log(`${animal.name} is ${animal.size}lb`)
}

console.log(animal);
showSize(bear);
console.log(tiger);