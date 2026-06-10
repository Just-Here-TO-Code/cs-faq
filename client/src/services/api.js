import axios from 'axios'

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

// Auth
export const register = (data) => api.post('/auth/register', data).then(r => r.data)
export const login    = (data) => api.post('/auth/login', data).then(r => r.data)
export const fetchMe  = ()     => api.get('/auth/me').then(r => r.data)

// FAQs
export const fetchFAQs = (params = {}) => api.get('/faqs', { params }).then(r => r.data)
export const fetchFAQCategories = () => api.get('/faqs/categories').then(r => r.data)
export const voteFAQ = (id, vote) => api.post(`/faqs/${id}/vote`, { vote }).then(r => r.data)

// Questions
export const fetchQuestions = (params = {}) => api.get('/questions', { params }).then(r => r.data)
export const fetchQuestion  = (id) => api.get(`/questions/${id}`).then(r => r.data)
export const fetchSimilar   = (q)  => api.get('/questions/similar', { params: { q } }).then(r => r.data)
export const createQuestion = (data) => api.post('/questions', data).then(r => r.data)
export const updateQuestionStatus = (id, status) =>
  api.patch(`/questions/${id}/status`, { status }).then(r => r.data)

// Answers
export const fetchAnswers = (questionId, params = {}) =>
  api.get(`/answers/${questionId}`, { params }).then(r => r.data)
export const createAnswer = (data) => api.post('/answers', data).then(r => r.data)
export const updateAnswerStatus = (id, status) =>
  api.patch(`/answers/${id}/status`, { status }).then(r => r.data)
