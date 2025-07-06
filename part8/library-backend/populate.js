const mongoose = require("mongoose");
require("dotenv").config();

const Author = require("./models/Author");
const Book = require("./models/Book");

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI);

const authors = [
  {
    name: "Robert Martin",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky",
  },
  {
    name: "Sandi Metz",
  },
];

const books = [
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

const populateDB = async () => {
  try {
    // Clear existing data
    await Author.deleteMany({});
    await Book.deleteMany({});

    // Create authors
    const authorPromises = authors.map((author) => {
      const authorObject = new Author(author);
      return authorObject.save();
    });

    const savedAuthors = await Promise.all(authorPromises);
    console.log("Authors saved:", savedAuthors.length);

    // Create books
    for (const book of books) {
      const author = await Author.findOne({ name: book.author });
      const bookObject = new Book({
        title: book.title,
        published: book.published,
        author: author._id,
        genres: book.genres,
      });
      await bookObject.save();
    }

    console.log("Books saved:", books.length);
    console.log("Database populated successfully!");
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    mongoose.connection.close();
  }
};

populateDB();
