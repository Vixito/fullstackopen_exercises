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
    },
    {
      title: "Refactoring to patterns",
      published: 2008,
      author: "Joshua Kerievsky",
      genres: ["refactoring", "patterns"],
    },
    {
      title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
      published: 2012,
      author: "Sandi Metz",
      genres: ["refactoring", "design"],
    },
    {
      title: "Crime and punishment",
      published: 1866,
      author: "Fyodor Dostoevsky",
      genres: ["classic", "crime"],
    },
    {
      title: "Demons",
      published: 1872,
      author: "Fyodor Dostoevsky",
      genres: ["classic", "revolution"],
    },
  ];

  // Crear autores
  for (const authorData of authorsData) {
    const author = new Author(authorData);
    await author.save();
  }

  // Crear libros
  for (const bookData of booksData) {
    const author = await Author.findOne({ name: bookData.author });
    const book = new Book({
      title: bookData.title,
      published: bookData.published,
      author: author._id,
      genres: bookData.genres,
    });
    await book.save();
  }

  console.log("Database populated successfully!");

  // Crear un usuario de prueba automáticamente
  const testUser = new User({
    username: "testuser",
    favoriteGenre: "refactoring",
  });
  await testUser.save();
  console.log("Test user created: testuser");
};

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
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (root, args) => {
      let filter = {};

      // Filtro por género usando MongoDB array query
      if (args.genre) {
        filter.genres = { $in: [args.genre] };
      }

      // Filtro por autor
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id;
        } else {
          // Si el autor no existe, retornamos array vacío
          return [];
        }
      }

      return Book.find(filter).populate("author");
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      let author = await Author.findOne({ name: args.author });

      if (!author) {
        const newAuthor = new Author({ name: args.author });
        try {
          author = await newAuthor.save();
        } catch (error) {
          throw new GraphQLError("Creating author failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      });

      try {
        const savedBook = await book.save();
        return Book.findById(savedBook._id).populate("author");
      } catch (error) {
        throw new GraphQLError("Creating book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          },
        });
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;
      try {
        return await author.save();
      } catch (error) {
        throw new GraphQLError("Editing author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          },
        });
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      try {
        return await user.save();
      } catch (error) {
        throw new GraphQLError("Creating user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          },
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user) {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },
  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({ author: root._id });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    console.log("Auth header:", auth);

    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      try {
        const token = auth.substring(7);
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);
        console.log(
          "Current user found:",
          currentUser ? currentUser.username : "null"
        );
        return { currentUser };
      } catch (error) {
        console.log("Token verification failed:", error.message);
        return { currentUser: null };
      }
    }
    console.log("No auth header");
    return { currentUser: null };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
