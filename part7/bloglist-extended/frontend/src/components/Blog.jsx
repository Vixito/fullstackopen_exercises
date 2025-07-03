import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Blog = ({ blog, handleLike, handleRemove, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="blog">
      <div>
        <h3>
          <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
        </h3>
        <span className="blog-author">by {blog.author}</span>
        <div className="blog-actions">
          <button onClick={() => setShowDetails(!showDetails)} className="btn btn-secondary">
            {showDetails ? 'hide' : 'view'}
          </button>
        </div>
      </div>
      {showDetails && (
        <div className="blogDetails">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}
            <button onClick={likeBlog} className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>
              like
            </button>
          </div>
          <div>{blog.user && blog.user.name}</div>
          {isOwner && (
            <button onClick={removeBlog} className="btn btn-danger">
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
