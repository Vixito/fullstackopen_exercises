import { useState, useEffect } from "react";
import { useSubscription, useApolloClient } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import {
  BOOK_ADDED,
  ALL_BOOKS,
  ALL_AUTHORS,
  ALL_BOOKS_BY_GENRE,
} from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  // Función para actualizar libros en la caché
  const updateBookCache = (client, addedBook) => {
    // Función para evitar duplicados
    const uniques = (a) => {
      let seen = new Set();
      return a.filter((item) => {
        let k = item.title + item.author.name;
        return seen.has(k) ? false : seen.add(k);
      });
    };

    // Actualizar ALL_BOOKS
    client.cache.updateQuery({ query: ALL_BOOKS }, (data) => {
      if (!data) return null;
      return {
        allBooks: uniques([...data.allBooks, addedBook]),
      };
    });

    // Actualizar queries filtradas por género
    addedBook.genres.forEach((genre) => {
      client.cache.updateQuery(
        {
          query: ALL_BOOKS_BY_GENRE,
          variables: { genre },
        },
        (data) => {
          if (!data) return null;
          return {
            allBooks: uniques([...data.allBooks, addedBook]),
          };
        }
      );
    });
  };

  // Suscripción para notificar cuando se agregue un libro
  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded;

      // Mostrar notificación
      window.alert(
        `New book added: "${addedBook.title}" by ${addedBook.author.name}`
      );

      // Actualizar caché de libros
      updateBookCache(client, addedBook);

      // Actualizar caché de autores
      client.cache.updateQuery({ query: ALL_AUTHORS }, (data) => {
        if (!data) return null;

        const authorExists = data.allAuthors.find(
          (author) => author.name === addedBook.author.name
        );

        if (!authorExists) {
          // Nuevo autor
          return {
            allAuthors: [
              ...data.allAuthors,
              {
                ...addedBook.author,
                bookCount: 1,
              },
            ],
          };
        } else {
          // Autor existente, actualizar bookCount
          return {
            allAuthors: data.allAuthors.map((author) =>
              author.name === addedBook.author.name
                ? { ...author, bookCount: author.bookCount + 1 }
                : author
            ),
          };
        }
      });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("library-user-token");
    if (token) {
      setToken(token);
    }
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    setPage("authors");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && (
          <button onClick={() => setPage("recommend")}>recommend</button>
        )}
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <button onClick={logout}>logout</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} setPage={setPage} />

      <Recommendations show={page === "recommend"} />

      <LoginForm
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
      />
    </div>
  );
};

export default App;
