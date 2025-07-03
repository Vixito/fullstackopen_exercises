import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

const BlogView = () => {
  const { id } = useParams();
  const { blogs, isLoading, error, addComment } = useBlog();
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

  return (
    <div>
      <h2>{blog.title}</h2>
      <p>
        <a href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
      </p>
      <p>{blog.likes} likes</p>
      <p>added by {blog.user.name}</p>

      <h3>comments</h3>
      <form onSubmit={handleAddComment}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">add comment</button>
      </form>

      <ul>
        {blog.comments && blog.comments.length > 0 ? (
          blog.comments.map((comment, index) => <li key={index}>{comment}</li>)
        ) : (
          <li>No comments yet</li>
        )}
      </ul>
    </div>
  );
};

export default BlogView;
