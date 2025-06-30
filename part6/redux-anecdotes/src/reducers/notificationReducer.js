import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: '',
  reducers: {
    setNotification(state, action) {
      return action.payload
    },
    clearNotification() {
      return ''
    }
  }
})

export const { clearNotification } = notificationSlice.actions

let timeoutId

export const setNotification = (message, seconds = 5) => {
  return dispatch => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    dispatch(notificationSlice.actions.setNotification(message))
    timeoutId = setTimeout(() => {
      dispatch(notificationSlice.actions.clearNotification())
    }, seconds * 1000)
  }
}

export default notificationSlice.reducer