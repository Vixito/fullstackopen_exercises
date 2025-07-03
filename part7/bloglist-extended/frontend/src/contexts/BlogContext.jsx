import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogService from '../services/blogs';
import { useNotification } from './NotificationContext';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const showNotification = useNotification();

  // Query for fetching blogs
  const {
    data: blogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
  });

  // Mutation for creating a new blog
  const createBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (returnedBlog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showNotification(
        `A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`,
        'success'
      );
    },
    onError: (error) => {
      console.error('Error adding blog:', error);
      showNotification('Error adding blog', 'error');
    },
  });

  // Mutation for updating a blog (likes)
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blog }) => blogService.update(id, blog),
    onMutate: async ({ id, blog }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['blogs'] });

      // Snapshot the previous value
      const previousBlogs = queryClient.getQueryData(['blogs']);

      // Optimistically update to the new value
      queryClient.setQueryData(['blogs'], (old) =>
        old?.map((b) => (b.id === id ? { ...b, ...blog } : b))
      );

      // Return a context object with the snapshotted value
      return { previousBlogs };
    },
    onError: (err, newBlog, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['blogs'], context.previousBlogs);
      console.error('Error updating likes:', err);
      showNotification('Error updating likes', 'error');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  // Mutation for removing a blog
  const removeBlogMutation = useMutation({
    mutationFn: (blog) => blogService.remove(blog.id),
    onSuccess: (_, blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showNotification(`Blog "${blog.title}" removed`, 'success');
    },
    onError: (error) => {
      console.error('Error removing blog:', error);
      showNotification('Error removing blog', 'error');
    },
  });

  const value = {
    blogs,
    isLoading,
    error,
    createBlog: (blogData, options) => createBlogMutation.mutate(blogData, options),
    updateBlog: updateBlogMutation.mutate,
    removeBlog: removeBlogMutation.mutate,
    isCreating: createBlogMutation.isPending,
    isUpdating: updateBlogMutation.isPending,
    isRemoving: removeBlogMutation.isPending,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
