import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLField,
} from "graphql";
import { resolvers } from "./resolvers.js";

/**
 * User GraphQL type definition.
 * Defines the structure and fields available for user queries.
 */
const UserType = new GraphQLObjectType({
  name: "User",
  description: "A user in the system",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Unique user identifier",
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User's full name",
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User's email address",
    },
  }),
});

/**
 * Query root type.
 * Defines top-level queries available in the API.
 */
const QueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root query type",
  fields: () => ({
    hello: {
      type: GraphQLString,
      description: "Simple greeting query",
      resolve: () => resolvers.hello(),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
      description: "Get all users",
      resolve: () => resolvers.users(),
    },
    user: {
      type: UserType,
      description: "Get a user by ID",
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: "User ID",
        },
      },
      resolve: (_parent, args) => resolvers.getUserById(args.id),
    },
  }),
});

/**
 * Mutation root type.
 * Defines mutations available in the API for modifying data.
 */
const MutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation type",
  fields: () => ({
    createUser: {
      type: new GraphQLNonNull(UserType),
      description: "Create a new user",
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
          description: "User's full name",
        },
        email: {
          type: new GraphQLNonNull(GraphQLString),
          description: "User's email address",
        },
      },
      resolve: (_parent, args) =>
        resolvers.createUser({ name: args.name, email: args.email }),
    },
    updateUser: {
      type: UserType,
      description: "Update an existing user",
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: "User ID",
        },
        name: {
          type: GraphQLString,
          description: "User's full name",
        },
        email: {
          type: GraphQLString,
          description: "User's email address",
        },
      },
      resolve: (_parent, args) =>
        resolvers.updateUser(args.id, {
          name: args.name,
          email: args.email,
        }),
    },
    deleteUser: {
      type: GraphQLString,
      description: "Delete a user",
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: "User ID",
        },
      },
      resolve: (_parent, args) => resolvers.deleteUser(args.id),
    },
  }),
});

/**
 * GraphQL schema combining queries and mutations.
 * Defines the complete API structure and types available to clients.
 */
export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
