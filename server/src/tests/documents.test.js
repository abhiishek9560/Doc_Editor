import request from 'supertest'
import app from '../index.js'

const TEST_EMAIL = 'abhishek@ajaia.dev'
const TEST_PASSWORD = 'Test@1234'

let authToken = ''
let createdDocId = ''

describe('DocFlow API', () => {

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  test('POST /api/auth/login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    authToken = res.body.token
  })

  test('POST /api/documents creates a document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Document' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Test Document')
    expect(res.body.id).toBeDefined()
    createdDocId = res.body.id
  })

  test('GET /api/documents returns owned documents', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.owned).toBeDefined()
    expect(Array.isArray(res.body.owned)).toBe(true)
    expect(res.body.owned.some(d => d.id === createdDocId)).toBe(true)
  })

  test('PUT /api/documents/:id updates title', async () => {
    const res = await request(app)
      .put(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Renamed Document' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Renamed Document')
  })

  test('GET /api/documents/:id returns document', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(createdDocId)
  })

  test('DELETE /api/documents/:id deletes document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Document deleted')
  })

  test('GET /api/documents/:id returns 404 after delete', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(404)
  })

})
