// Test script for checking the GraphQL API with user authentication
// Run this in Apollo Studio or any GraphQL client

// 1. First, create a user
const createUserMutation = `
mutation {
  createUser(
    username: "testuser"
    favoriteGenre: "refactoring"
  ) {
    username
    favoriteGenre
    id
  }
}
`;

// 2. Login to get a token
const loginMutation = `
mutation {
  login(username: "testuser") {
    value
  }
}
`;

// 3. Test the me query (requires Authorization header with Bearer token)
const meQuery = `
query {
  me {
    username
    favoriteGenre
    id
  }
}
`;

// 4. Try adding a book without authentication (should fail)
const addBookWithoutAuth = `
mutation {
  addBook(
    title: "Test Book"
    author: "Test Author"
    published: 2023
    genres: ["test"]
  ) {
    title
    author {
      name
    }
    published
    genres
  }
}
`;

// 5. Try adding a book with authentication (should work)
// Use the same mutation as above but include the Authorization header:
// {"Authorization": "Bearer YOUR_JWT_TOKEN_HERE"}

// 6. Test book filtering by author
const booksByAuthor = `
query {
  allBooks(author: "Robert Martin") {
    title
    author {
      name
    }
    published
  }
}
`;

// 7. Test book filtering by genre
const booksByGenre = `
query {
  allBooks(genre: "refactoring") {
    title
    author {
      name
    }
    genres
  }
}
`;

console.log("Run these queries in Apollo Studio at http://localhost:4000");
console.log(
  "Remember to use the Authorization header for authenticated operations!"
);
