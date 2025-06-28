import React from 'react'
import { render, screen } from '@testing-library/react'
import Blog from '../src/components/Blog'

const blog = {
  title: 'Testing React components',
  author: 'Test Author',
  url: 'http://test.com',
  likes: 5,
  user: { username: 'tester', name: 'Test User', id: '123' }
}

test('renders title and author, but not url or likes by default', () => {
  render(<Blog blog={blog} currentUser={blog.user} handleLike={() => {}} handleRemove={() => {}} />)
  const element = screen.getByText(/Testing React components Test Author/i)
  expect(element).toBeDefined()
  expect(screen.queryByText('http://test.com')).toBeNull()
  expect(screen.queryByText(/likes/)).toBeNull()
})