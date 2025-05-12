import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { join } from 'path';
import { movieResolvers } from './resolvers/movie.resolvers';
import { userResolvers } from './resolvers/user.resolvers';
import { recommendationResolvers } from './resolvers/recommendation.resolvers';

// Load schema from .graphql file
const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
});

// Combine resolvers
const resolvers = [
  movieResolvers,
  userResolvers,
  recommendationResolvers
];

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
}); 