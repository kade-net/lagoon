import 'dotenv/config';
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer   } from "@apollo/server/standalone"
import TypeDef from "./typedef";
import { AccountsResolver, CommunityResolver, NotificationsResolver, PublicationResolver } from "./resolvers/queries";
import KadeOracle from "@kade-net/oracle";
import express from "express";
import http from "http";
import bodyParser from 'body-parser'
import { expressMiddleware } from '@apollo/server/express4'


import { GraphQLScalarType, Kind } from 'graphql';
import GraphQLJSON from "graphql-type-json";

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});

const expressApp = express()
const httpServer = http.createServer(expressApp)

const server = new ApolloServer({
    typeDefs: TypeDef,
  resolvers: [AccountsResolver, PublicationResolver, CommunityResolver, NotificationsResolver, {
        Date: dateScalar,
        JSON: GraphQLJSON
  }] as any,
  introspection: true
})

await server.start()

expressApp.use(bodyParser.json({
  limit: '10mb'
}))
expressApp.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}))

expressApp.use((req, res, next) => {
  console.log(`Request received at ${new Date().toISOString()}`);
  next();
});


expressApp.use(expressMiddleware(server, {
  context: async ({ req, res }) => ({
    req,
    res,
    oracle: KadeOracle 
  })
}))

httpServer.listen({
  port: process.env.PORT || 4000
}, () => {
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}`)
})
