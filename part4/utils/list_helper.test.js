const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })
})

describe('favorite blog', () => {
  const emptyList = []

  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const blogs = [
    {
      _id: '1',
      title: 'Blog A',
      author: 'Author A',
      url: 'urlA',
      likes: 7,
      __v: 0
    },
    {
      _id: '2',
      title: 'Blog B',
      author: 'Author B',
      url: 'urlB',
      likes: 12,
      __v: 0
    },
    {
      _id: '3',
      title: 'Blog C',
      author: 'Author C',
      url: 'urlC',
      likes: 12,
      __v: 0
    }
  ]

  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog(emptyList)
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('of a bigger list returns one of the blogs with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    // Puede ser Blog B o Blog C, ambos tienen 12 likes
    const possible = [
      { title: 'Blog B', author: 'Author B', likes: 12 },
      { title: 'Blog C', author: 'Author C', likes: 12 }
    ]
    assert.ok(possible.some(blog =>
      result.title === blog.title &&
      result.author === blog.author &&
      result.likes === blog.likes
    ))
  })
})

describe('most blogs', () => {
  const emptyList = []

  const blogs = [
    { _id: '1', title: 'A', author: 'Author A', url: 'urlA', likes: 1, __v: 0 },
    { _id: '2', title: 'B', author: 'Author B', url: 'urlB', likes: 2, __v: 0 },
    { _id: '3', title: 'C', author: 'Author A', url: 'urlC', likes: 3, __v: 0 },
    { _id: '4', title: 'D', author: 'Author B', url: 'urlD', likes: 4, __v: 0 },
    { _id: '5', title: 'E', author: 'Author B', url: 'urlE', likes: 5, __v: 0 }
  ]

  test('of empty list is null', () => {
    const result = listHelper.mostBlogs(emptyList)
    assert.strictEqual(result, null)
  })

  test('returns the author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Author B', blogs: 3 })
  })
})

