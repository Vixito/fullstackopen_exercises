import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = (props) => {
  const booksResult = useQuery(ALL_BOOKS);
  const userResult = useQuery(ME);

  if (!props.show) {
    return null;
  }

  if (booksResult.loading || userResult.loading) {
    return <div>loading...</div>;
  }

  if (!userResult.data.me) {
    return <div>You must be logged in to see recommendations</div>;
  }

  const books = booksResult.data.allBooks;
  const user = userResult.data.me;

  // Filtrar libros por el género favorito del usuario
  const recommendedBooks = books.filter((book) =>
    book.genres.includes(user.favoriteGenre)
  );

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{user.favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map((book) => (
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

export default Recommendations;
