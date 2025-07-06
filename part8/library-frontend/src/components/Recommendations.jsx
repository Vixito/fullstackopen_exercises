import { useQuery } from "@apollo/client";
import { ALL_BOOKS_BY_GENRE, ME } from "../queries";

const Recommendations = (props) => {
  const userResult = useQuery(ME, {
    errorPolicy: "all", // Para ver errores
    fetchPolicy: "cache-and-network", // Para asegurar que se ejecute la query
  });

  // Solo hacer la query de libros cuando tengamos el usuario
  const user = userResult.data?.me;
  const booksResult = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre: user?.favoriteGenre },
    skip: !user, // Skip la query si no hay usuario
  });

  if (!props.show) {
    return null;
  }

  if (userResult.loading) {
    return <div>loading...</div>;
  }

  // Agregamos logging para debug
  console.log("userResult:", userResult);
  console.log("userResult.data:", userResult.data);
  console.log("userResult.error:", userResult.error);

  if (userResult.error) {
    return <div>Error: {userResult.error.message}</div>;
  }

  if (!userResult.data.me) {
    return <div>You must be logged in to see recommendations</div>;
  }

  if (booksResult.loading) {
    return <div>loading...</div>;
  }

  const recommendedBooks = booksResult.data.allBooks;

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
