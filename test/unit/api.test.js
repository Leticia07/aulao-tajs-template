import { describe, it, before, after } from 'node:test'
import { handler } from '../../api.js'
import assert from 'node:assert'
import EventEmitter from 'node:events';

const mockRequest = ({ url, method, headers, body }) => {
  const options = {
    url: url ?? '/',
    method: method ?? 'GET',
    headers: headers ?? {}
  }

  const request = new EventEmitter()

  request.url = options.url
  request.method = options.method
  request.headers = options.headers

  setTimeout(() => request.emit('data', JSON.stringify(body)))

  return request
}

const mockResponse = ({ mockContext }) => {
  const response = {
    writeHead: mockContext.fn(),
    end: mockContext.fn(),
    write: mockContext.fn(),
  }

  return response
}

const getFisrtCallArg = (mockFn) => mockFn.calls[0].arguments[0]

describe('API Unit test Suite', () => {
  describe('/login', () => {
    it('should receive not authorized when user or password is invalid', async (context) => {
      const inputRequest = mockRequest({
        url: '/login',
        method: 'POST',
        body: {
          user: '',
          password: '123'
        }
      })
      const outputResponse = mockResponse({
        mockContext: context.mock
      })
      await handler(inputRequest, outputResponse)
      assert.strictEqual(
        getFisrtCallArg(outputResponse.writeHead.mock),
        401,
        `should receive 401 status code, received ${getFisrtCallArg(outputResponse.writeHead.mock)}`
      )

      const expectedResponse = JSON.stringify({ error: 'user invalid!' })
      assert.strictEqual(outputResponse.end.mock.callCount(), 1, 'should call response.end once')
      assert.strictEqual(
        getFisrtCallArg(outputResponse.end.mock),
        expectedResponse,
        `should receive ${expectedResponse}, received ${getFisrtCallArg(outputResponse.end.mock)}`
      )
    })
  })
})