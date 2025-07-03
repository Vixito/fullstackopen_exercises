import { Link } from 'react-router-dom';
import { useUsers } from '../contexts/UsersContext';

const Users = () => {
  const { users, isLoading, error } = useUsers();

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link to={`/users/${user.id}`}>{user.name}</Link>
                </td>
                <td>{user.blogs ? user.blogs.length : 0}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
