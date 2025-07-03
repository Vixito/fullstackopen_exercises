import { useRef } from 'react';
import Blog from './Blog';
import BlogForm from './BlogForm';
import Togglable from './Togglable';
import { useBlog } from '../contexts/BlogContext';
import { useUser } from '../contexts/UserContext';

const BlogList = ({ addBlog, handleLike, handleRemove }) => {
  const { blogs, isLoading, error } = useBlog();
  const { user } = useUser();
  const blogFormRef = useRef();

  if (isLoading) {
    return <div>Loading blogs...</div>;
  }

  if (error) {
    return <div>Error loading blogs: {error.message}</div>;
  }

  return (
    <div>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={(blogObject) => addBlog(blogObject, blogFormRef)} />
      </Togglable>
      {blogs &&
        blogs
          .slice() // copia para no mutar el estado original
          .sort((a, b) => b.likes - a.likes)
          .map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              handleLike={handleLike}
              handleRemove={handleRemove}
              currentUser={user}
            />
          ))}
    </div>
  );
};

export default BlogList;
