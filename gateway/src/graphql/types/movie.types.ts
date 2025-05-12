export const movieTypeDefs = `#graphql
  extend type Query {
    movies(page: Int, limit: Int): MovieConnection!
    movie(id: ID!): Movie
    searchMovies(query: String!): [Movie!]!
  }

  extend type Mutation {
    createMovie(input: CreateMovieInput!): Movie!
    updateMovie(id: ID!, input: UpdateMovieInput!): Movie!
    deleteMovie(id: ID!): Boolean!
  }

  type Movie {
    id: ID!
    title: String!
    genre: String!
    summary: String!
    rating: Float!
    releaseYear: Int!
    posterUrl: String
    createdAt: String!
    updatedAt: String!
    recommendations: [Movie!]!
  }

  type MovieConnection {
    edges: [Movie!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  input CreateMovieInput {
    title: String!
    genre: String!
    summary: String!
    rating: Float!
    releaseYear: Int!
    posterUrl: String
  }

  input UpdateMovieInput {
    title: String
    genre: String
    summary: String
    rating: Float
    releaseYear: Int
    posterUrl: String
  }
`; 