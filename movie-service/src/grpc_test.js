const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/movie.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const MovieService = grpc.loadPackageDefinition(packageDefinition).movie.MovieService;
const client = new MovieService('localhost:50051', grpc.credentials.createInsecure());

// Test GetMovie with known ID
console.log('Testing GetMovie with specific ID...');
client.GetMovie({ _id: '681c0de65858337ba0911368' }, (error, movie) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  console.log('GetMovie Response:', movie);
});

// Test ListMovies
console.log('\nTesting ListMovies...');
client.ListMovies({ page: 1, limit: 10 }, (error, response) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  console.log('ListMovies Response:', response);
});

// Test CreateMovie
const movieData = {
  title: 'Test Movie',
  genre: 'Action',
  summary: 'A test movie summary',
  rating: 8.5,
  releaseYear: 2024,
  posterUrl: 'http://example.com/poster.jpg'
};

console.log('\nTesting CreateMovie...');
client.CreateMovie(movieData, (error, response) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  console.log('CreateMovie Response:', response);
  
  if (response._id) {
    console.log('\nTesting GetMovie with created movie ID:', response._id);
    client.GetMovie({ _id: response._id }, (error, movie) => {
      if (error) {
        console.error('Error:', error.message);
        return;
      }
      console.log('GetMovie Response:', movie);
    });
  }
}); 