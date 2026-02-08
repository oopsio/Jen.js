const users = [];
export const resolvers = {
  users: () => users,
  createUser: ({ name, email }) => {
    const user = { id: (users.length + 1).toString(), name, email };
    users.push(user);
    return user;
  },
};
