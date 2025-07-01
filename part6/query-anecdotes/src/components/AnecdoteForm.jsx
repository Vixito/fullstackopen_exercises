import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnecdote } from '../services/anecdotes'
import { useNotificationDispatch } from '../NotificationContext'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()
  const dispatchNotification = useNotificationDispatch()

  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      queryClient.setQueryData(['anecdotes'], (oldAnecdotes) => oldAnecdotes.concat(newAnecdote))
      dispatchNotification({ type: 'SHOW', payload: `you created '${newAnecdote.content}'` })
      setTimeout(() => {
        dispatchNotification({ type: 'HIDE' })
      }, 5000)
    },
    onError: (error) => {
      dispatchNotification({ type: 'SHOW', payload: 'anecdote content must be at least 5 characters' })
      setTimeout(() => {
        dispatchNotification({ type: 'HIDE' })
      }, 5000)
    }
  })

  const onCreate = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''
    newAnecdoteMutation.mutate(content)
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name='anecdote' />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
