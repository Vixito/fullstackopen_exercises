const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { PubSub } = require("graphql-subscriptions");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const http = require("http");

const JWT_SECRET = "SUPERSECRETKEY";
const pubsub = new PubSub();

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

// Función para calcular bookCount de manera eficiente (resuelve n+1)
const calculateBookCounts = () => {
  const bookCounts = {};

  // Contar libros por autor en una sola pasada
  books.forEach((book) => {
    const authorId = book.author.id;
    bookCounts[authorId] = (bookCounts[authorId] || 0) + 1;
  });

  return bookCounts;
};

// Actualizar conteo de libros para cada autor
const updateBookCounts = () => {
  const bookCounts = calculateBookCounts();
  authors.forEach((author) => {
    author.bookCount = bookCounts[author.id] || 0;
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

  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let filteredBooks = books;

      if (args.author) {
        filteredBooks = filteredBooks.filter(
          (book) => book.author.name === args.author
        );
      }

      if (args.genre) {
        filteredBooks = filteredBooks.filter((book) =>
          book.genres.includes(args.genre)
        );
      }

      return filteredBooks;
    },
    allAuthors: () => {
      // Solución n+1: Calcular todos los bookCounts de una vez
      const bookCounts = calculateBookCounts();

      return authors.map((author) => ({
        ...author,
        bookCount: bookCounts[author.id] || 0,
      }));
    },
    me: (root, args, context) => {
      console.log("ME query - context.currentUser:", context.currentUser);
      return context.currentUser;
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      console.log(
        "ADD_BOOK mutation - context.currentUser:",
        context.currentUser
      );

      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      // Buscar o crear autor
      let author = authors.find((a) => a.name === args.author);
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

      // Publicar suscripción
      pubsub.publish("BOOK_ADDED", { bookAdded: book });

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

      const author = authors.find((a) => a.name === args.name);
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;
      console.log("Author updated:", author);
      return author;
    },

    createUser: (root, args) => {
      const existingUser = users.find((u) => u.username === args.username);
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
      const user = users.find((u) => u.username === args.username);

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

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

// Función para obtener usuario del contexto
const getUser = async (req) => {
  const auth = req ? req.headers.authorization : null;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = users.find((u) => u.id === decodedToken.id);
      console.log(
        "Auth context - found user:",
        currentUser?.username || "null"
      );
      return currentUser;
    } catch (error) {
      console.log("Token verification failed:", error.message);
      return null;
    }
  }
  return null;
};

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // WebSocket server para suscripciones
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        // Para suscripciones WebSocket, el contexto puede ser diferente
        return {};
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://studio.apollographql.com",
      ],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const currentUser = await getUser(req);
        return { currentUser };
      },
    })
  );

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    console.log(
      "Available users:",
      users.map((u) => u.username)
    );
    console.log("Total books:", books.length);
    console.log("Total authors:", authors.length);
  });
};

start();
