import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

const BlogView = () => {
  const { id } = useParams();
  const { blogs, isLoading, error, addComment, updateBlog } = useBlog();
  const [comment, setComment] = useState('');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading blog: {error.message}</div>;
  }

  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return <div>Blog not found</div>;
  }

  const handleAddComment = (event) => {
    event.preventDefault();
    if (comment.trim()) {
      addComment({ id: blog.id, comment });
      setComment('');
    }
  };

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id || blog.user, // Ensure user is ID
    };

    updateBlog({
      id: blog.id,
      blog: updatedBlog,
    });
  };

  return (
    <div className="blog-view">
      <h2>{blog.title}</h2>
      <div className="blog-meta">
        <p>
          <a href={blog.url} target="_blank" rel="noopener noreferrer" className="blog-url">
            {blog.url}
          </a>
        </p>
        <div className="like-section">
          <span className="like-count">{blog.likes} likes</span>{' '}
          <button onClick={handleLike} className="btn btn-primary">
            like
          </button>
        </div>
        <p>added by {blog.user.name}</p>
      </div>

      <div className="comments-section">
        <h3>comments</h3>
        <form onSubmit={handleAddComment} className="comment-form">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
          />
          <button type="submit" className="btn btn-primary">
            add comment
          </button>
        </form>

        <ul className="comment-list">
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment, index) => <li key={index}>{comment}</li>)
          ) : (
            <li>No comments yet</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BlogView;
