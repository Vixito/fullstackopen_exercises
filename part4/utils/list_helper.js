const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const favorite = blogs.reduce((max, blog) =>
    (blog.likes > (max.likes || 0) ? blog : max), {})

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const counts = {}
  blogs.forEach(blog => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  let maxAuthor = null
  let maxBlogs = 0
  for (const author in counts) {
    if (counts[author] > maxBlogs) {
      maxAuthor = author
      maxBlogs = counts[author]
    }
  }

  return {
    author: maxAuthor,
    blogs: maxBlogs
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}