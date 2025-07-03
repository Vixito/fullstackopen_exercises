import { useParams } from 'react-router-dom';
import { useUsers } from '../contexts/UsersContext';

const User = () => {
  const { id } = useParams();
  const { users, isLoading, error } = useUsers();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading user: {error.message}</div>;
  }

  const user = users.find((u) => u.id === id);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      {user.blogs && user.blogs.length > 0 ? (
        <ul>
          {user.blogs.map((blog) => (
            <li key={blog.id}>{blog.title}</li>
          ))}
        </ul>
      ) : (
        <p>No blogs added</p>
      )}
    </div>
  );
};

export default User;
