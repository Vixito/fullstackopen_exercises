import { createSlice } from '@reduxjs/toolkit';
import blogService from '../services/blogs';

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload;
    },
    appendBlog(state, action) {
      state.push(action.payload);
    },
    updateBlog(state, action) {
      const updated = action.payload;
      return state.map((b) => (b.id === updated.id ? updated : b));
    },
    removeBlog(state, action) {
      const id = action.payload;
      return state.filter((b) => b.id !== id);
    },
  },
});

export const { setBlogs, appendBlog, updateBlog, removeBlog } = blogSlice.actions;

// Thunks
export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll();
    dispatch(setBlogs(blogs));
  };
};

export const createBlog = (blogObject) => {
  return async (dispatch) => {
    const newBlog = await blogService.create(blogObject);
    dispatch(appendBlog(newBlog));
  };
};

export const likeBlog = (blogToUpdate) => {
  return async (dispatch) => {
    const blogObject = {
      user: blogToUpdate.user.id || blogToUpdate.user,
      likes: blogToUpdate.likes,
      author: blogToUpdate.author,
      title: blogToUpdate.title,
      url: blogToUpdate.url,
    };
    const updatedBlog = await blogService.update(blogToUpdate.id, blogObject);
    dispatch(updateBlog({ ...updatedBlog, user: blogToUpdate.user }));
  };
};

export const deleteBlog = (id) => {
  return async (dispatch) => {
    await blogService.remove(id);
    dispatch(removeBlog(id));
  };
};

export default blogSlice.reducer;
