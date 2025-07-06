import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ALL_BOOKS_BY_GENRE } from "../queries";

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Query para obtener todos los libros (para géneros únicos)
  const allBooksResult = useQuery(ALL_BOOKS);

  // Query para obtener libros filtrados por género
  const filteredBooksResult = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre: selectedGenre },
  });

  if (!props.show) {
    return null;
  }

  if (allBooksResult.loading || filteredBooksResult.loading) {
    return <div>loading...</div>;
  }

  const allBooks = allBooksResult.data.allBooks;
  const booksToShow = filteredBooksResult.data.allBooks;

  // Obtener todos los géneros únicos de todos los libros
  const allGenres = [...new Set(allBooks.flatMap((book) => book.genres))];

  return (
    <div>
      <h2>books</h2>

      <div>
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
        {allGenres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
      </div>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
