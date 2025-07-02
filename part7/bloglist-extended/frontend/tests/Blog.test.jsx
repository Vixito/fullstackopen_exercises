import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Blog from '../src/components/Blog';
import BlogForm from '../src/components/BlogForm';

const blog = {
  title: 'Testing React components',
  author: 'Test Author',
  url: 'http://test.com',
  likes: 5,
  user: { username: 'tester', name: 'Test User', id: '123' },
};

test('renders title and author, but not url or likes by default', () => {
  render(
    <Blog blog={blog} currentUser={blog.user} handleLike={() => {}} handleRemove={() => {}} />
  );
  const element = screen.getByText(/Testing React components Test Author/i);
  expect(element).toBeDefined();
  expect(screen.queryByText('http://test.com')).toBeNull();
  expect(screen.queryByText(/likes/)).toBeNull();
});

test('shows url and likes when view button is clicked', () => {
  render(
    <Blog blog={blog} currentUser={blog.user} handleLike={() => {}} handleRemove={() => {}} />
  );
  const button = screen.getByText('view');
  fireEvent.click(button);
  expect(screen.getByText('http://test.com')).toBeDefined();
  expect(screen.getByText(/likes 5/)).toBeDefined();
});

test('like button calls event handler twice if clicked twice', () => {
  const mockHandler = vi.fn();
  render(
    <Blog blog={blog} currentUser={blog.user} handleLike={mockHandler} handleRemove={() => {}} />
  );
  fireEvent.click(screen.getByText('view'));
  const likeButton = screen.getByText('like');
  fireEvent.click(likeButton);
  fireEvent.click(likeButton);
  expect(mockHandler).toHaveBeenCalledTimes(2);
});

test('calls onSubmit with correct details when a new blog is created', () => {
  const createBlog = vi.fn();
  render(<BlogForm createBlog={createBlog} />);

  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Blog' } });
  fireEvent.change(screen.getByLabelText(/author/i), { target: { value: 'Author Name' } });
  fireEvent.change(screen.getByLabelText(/url/i), { target: { value: 'http://blog.com' } });

  fireEvent.click(screen.getByText('create'));

  expect(createBlog).toHaveBeenCalledWith({
    title: 'New Blog',
    author: 'Author Name',
    url: 'http://blog.com',
  });
});
