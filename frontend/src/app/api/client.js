import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
})

// Regulations
export const getRegulations = () => api.get('/regulations/')
export const ingestRegulation = (data) => api.post('/regulations/ingest', data)
export const uploadRegulationPDF = (formData) =>
    api.post('/regulations/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
export const getSimilarRegulations = (id, topK = 5) =>
    api.get(`/regulations/${id}/similar?top_k=${topK}`)

// Policies
export const getPolicies = () => api.get('/policies/')
export const ingestPolicy = (data) =>
    api.post('/policies/ingest', data)
export const checkPolicyCompliance = (id) =>
    api.post(`/policies/${id}/compliance-check`)

// Impact
export const analyzeImpact = (regulationId, policyId) =>
    api.post(`/impact/analyze?regulation_id=${regulationId}&policy_id=${policyId}`)
export const getHeatmap = () => api.get('/impact/heatmap')
export const getImpactDetails = (dept, cat) => api.get(`/impact/details?dept=${dept}&cat=${cat}`)
export const getRegulationIntel = (id) => api.get(`/regulations/${id}/intel`)

// Alerts
export const getAlerts = () => api.get('/alerts/')
export const acknowledgeAlert = (id) => api.patch(`/alerts/${id}/acknowledge`)

// RAG
export const askQuestion = (question) =>
    api.post('/rag/explain', { question })

export default api
