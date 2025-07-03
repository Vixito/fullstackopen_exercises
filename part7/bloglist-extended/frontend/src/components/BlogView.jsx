import { useParams } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

const BlogView = () => {
  const { id } = useParams();
  const { blogs, isLoading, error } = useBlog();

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

  return (
    <div>
      <h2>{blog.title}</h2>
      <p>{blog.url}</p>
      <p>{blog.likes} likes</p>
      <p>added by {blog.user.name}</p>
    </div>
  );
};

export default BlogView;
