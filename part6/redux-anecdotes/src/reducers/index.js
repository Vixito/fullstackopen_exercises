import { combineReducers } from 'redux'
import anecdoteReducer from './anecdoteReducer'
import filterReducer from './filterReducer'

const reducer = combineReducers({
  anecdotes: anecdoteReducer,
  filter: filterReducer
})

export default reducer