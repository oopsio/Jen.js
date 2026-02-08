// Main entry point for JenPack example

interface User {
  name: string;
  age: number;
  email: string;
}

function createUser(name: string, age: number, email: string): User {
  return { name, age, email };
}

function greetUser(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

// Export for bundling
export { createUser, greetUser };

// Demo execution
const alice = createUser("Alice", 30, "alice@example.com");
console.log(greetUser(alice));

const users: User[] = [
  createUser("Bob", 25, "bob@example.com"),
  createUser("Charlie", 35, "charlie@example.com"),
];

users.forEach((user) => {
  console.log(greetUser(user));
});
