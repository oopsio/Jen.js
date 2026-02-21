interface User {
    id: string;
    name: string;
    email: string;
}
export declare const resolvers: {
    users: () => User[];
    createUser: ({ name, email }: {
        name: string;
        email: string;
    }) => {
        id: string;
        name: string;
        email: string;
    };
};
export {};
