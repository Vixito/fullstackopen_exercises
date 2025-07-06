const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const mongoose = require("mongoose");

const { connectDB } = require("./config/db");
const Author = require("./models/Author");
const Book = require("./models/Book");

// Inicializar conexión a MongoDB
connectDB().then(async () => {
  // Popular la base de datos si está vacía
  const authorCount = await Author.countDocuments();
  if (authorCount === 0) {
    console.log("Database is empty, populating with initial data...");
    await populateDatabase();
  }
});

const populateDatabase = async () => {
  const authorsData = [
    { name: "Robert Martin", born: 1952 },
    { name: "Martin Fowler", born: 1963 },
    { name: "Fyodor Dostoevsky", born: 1821 },
    { name: "Joshua Kerievsky" },
    { name: "Sandi Metz" },
  ];

  const booksData = [
    {
      title: "Clean Code",
      published: 2008,
      author: "Robert Martin",
      genres: ["refactoring"],
    },
    {
      title: "Agile software development",
      published: 2002,
      author: "Robert Martin",
      genres: ["agile", "patterns", "design"],
    },
    {
      title: "Refactoring, edition 2",
      published: 2018,
      author: "Martin Fowler",
      genres: ["refactoring"],
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

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
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
  },
  Mutation: {
    addBook: async (root, args) => {
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
    editAuthor: async (root, args) => {
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
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
