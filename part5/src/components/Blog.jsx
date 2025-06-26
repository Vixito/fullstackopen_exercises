import { useState } from 'react'

const Blog = ({ blog }) => {
  const [showDetails, setShowDetails] = useState(false)

  const blogStyle = {
    padding: 10,
    border: '1px solid #ccc',
    marginBottom: 5,
    borderRadius: 4,
    background: '#f9f9f9'
  }

  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} {blog.author}
        <button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>
      {showDetails && (
        <div className="blogDetails">
          <div>{blog.url}</div>
          <div>likes {blog.likes}</div>
          <div>{blog.user && blog.user.name}</div>
        </div>
      )}
    </div>
  )
}

export default Blog