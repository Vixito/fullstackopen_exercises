import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Blog = ({ blog, handleLike, handleRemove, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false);

  const blogStyle = {
    padding: 10,
    border: '1px solid #ccc',
    marginBottom: 5,
    borderRadius: 4,
    background: '#f9f9f9',
  };

  const likeBlog = () => {
    handleLike(blog);
  };

  const removeBlog = () => {
    handleRemove(blog);
  };

  // El usuario puede estar como objeto o id, por eso la comparación
  const isOwner =
    blog.user && (blog.user.username === currentUser.username || blog.user === currentUser.id);

  return (
    <div style={blogStyle} className="blog">
      <div>
        <Link to={`/blogs/${blog.id}`}>{blog.title}</Link> {blog.author}
        <button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>
      {showDetails && (
        <div className="blogDetails">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}
            <button onClick={likeBlog}>like</button>
          </div>
          <div>{blog.user && blog.user.name}</div>
          {isOwner && (
            <button onClick={removeBlog} style={{ background: 'red', color: 'white' }}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default Blog;
