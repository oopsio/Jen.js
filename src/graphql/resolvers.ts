interface User { id: string; name: string; email: string; }
const users: User[] = [];

export const resolvers = {
  users: () => users,
  createUser: ({ name, email }: { name: string, email: string }) => {
    const user = { id: (users.length+1).toString(), name, email };
    users.push(user);
    return user;
  }
};
