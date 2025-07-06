import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../queries";

const CreateUser = ({ show }) => {
  const [username, setUsername] = useState("");
  const [favoriteGenre, setFavoriteGenre] = useState("");

  const [createUser] = useMutation(CREATE_USER, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
    onCompleted: () => {
      setUsername("");
      setFavoriteGenre("");
    },
  });

  if (!show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    await createUser({ variables: { username, favoriteGenre } });
  };

  return (
    <div>
      <h2>Create New User</h2>
      <form onSubmit={submit}>
        <div>
          username{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          favorite genre{" "}
          <input
            value={favoriteGenre}
            onChange={({ target }) => setFavoriteGenre(target.value)}
          />
        </div>
        <button type="submit">create user</button>
      </form>
    </div>
  );
};

export default CreateUser;
