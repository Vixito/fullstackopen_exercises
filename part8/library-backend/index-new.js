const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "SUPERSECRETKEY"; // En producción, usar variable de entorno

// Base de datos en memoria simple
let authors = [
  { id: "1", name: "Robert Martin", born: 1952, bookCount: 0 },
  { id: "2", name: "Martin Fowler", born: 1963, bookCount: 0 },
  { id: "3", name: "Fyodor Dostoevsky", born: 1821, bookCount: 0 },
  { id: "4", name: "Joshua Kerievsky", bookCount: 0 },
  { id: "5", name: "Sandi Metz", bookCount: 0 },
];

let books = [
  {
    id: "1",
    title: "Clean Code",
    published: 2008,
    author: { id: "1", name: "Robert Martin", born: 1952 },
    genres: ["refactoring"],
  },
  {
    id: "2",
    title: "Agile software development",
    published: 2002,
    author: { id: "1", name: "Robert Martin", born: 1952 },
    genres: ["agile", "patterns", "design"],
  },
  {
    id: "3",
    title: "Refactoring, edition 2",
    published: 2018,
    author: { id: "2", name: "Martin Fowler", born: 1963 },
    genres: ["refactoring"],
  },
  {
    id: "4",
    title: "Refactoring to patterns",
    published: 2008,
    author: { id: "4", name: "Joshua Kerievsky" },
    genres: ["refactoring", "patterns"],
  },
  {
    id: "5",
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: { id: "5", name: "Sandi Metz" },
    genres: ["refactoring", "design"],
  },
  {
    id: "6",
    title: "Crime and punishment",
    published: 1866,
    author: { id: "3", name: "Fyodor Dostoevsky", born: 1821 },
    genres: ["classic", "crime"],
  },
  {
    id: "7",
    title: "Demons",
    published: 1872,
    author: { id: "3", name: "Fyodor Dostoevsky", born: 1821 },
    genres: ["classic", "revolution"],
  },
];

let users = [
  {
    id: "1",
    username: "testuser",
    favoriteGenre: "refactoring",
  },
];

// Generar IDs únicos
let nextId = 8;
const generateId = () => String(nextId++);

// Actualizar conteo de libros para cada autor
const updateBookCounts = () => {
  authors.forEach(author => {
    author.bookCount = books.filter(book => book.author.id === author.id).length;
  });
};

// Inicializar conteos
updateBookCounts();

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let filteredBooks = books;
      
      if (args.author) {
        filteredBooks = filteredBooks.filter(book => 
          book.author.name === args.author
        );
      }
      
      if (args.genre) {
        filteredBooks = filteredBooks.filter(book =>
          book.genres.includes(args.genre)
        );
      }
      
      return filteredBooks;
    },
    allAuthors: () => {
      updateBookCounts();
      return authors;
    },
    me: (root, args, context) => {
      console.log("ME query - context.currentUser:", context.currentUser);
      return context.currentUser;
    },
  },

  Mutation: {
    addBook: (root, args, context) => {
      console.log("ADD_BOOK mutation - context.currentUser:", context.currentUser);
      
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      // Buscar o crear autor
      let author = authors.find(a => a.name === args.author);
      if (!author) {
        const authorId = generateId();
        author = {
          id: authorId,
          name: args.author,
          bookCount: 0,
        };
        authors.push(author);
      }

      // Crear libro
      const book = {
        id: generateId(),
        title: args.title,
        published: args.published,
        author: author,
        genres: args.genres,
      };

      books.push(book);
      updateBookCounts();

      console.log("Book added:", book);
      return book;
    },

    editAuthor: (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const author = authors.find(a => a.name === args.name);
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;
      console.log("Author updated:", author);
      return author;
    },

    createUser: (root, args) => {
      const existingUser = users.find(u => u.username === args.username);
      if (existingUser) {
        throw new GraphQLError("Username already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const user = {
        id: generateId(),
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      };

      users.push(user);
      console.log("User created:", user);
      return user;
    },

    login: (root, args) => {
      const user = users.find(u => u.username === args.username);
      
      if (!user) {
        throw new GraphQLError("Wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user.id,
      };

      const token = jwt.sign(userForToken, JWT_SECRET);
      console.log("User logged in:", user.username, "Token generated");
      return { value: token };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = users.find(u => u.id === decodedToken.id);
      
      console.log("Auth context - decoded token:", decodedToken);
      console.log("Auth context - found user:", currentUser);
      
      return { currentUser };
    }
    
    console.log("Auth context - no valid auth found");
    return {};
  },
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log("Available users:", users.map(u => u.username));
  console.log("Total books:", books.length);
  console.log("Total authors:", authors.length);
});
