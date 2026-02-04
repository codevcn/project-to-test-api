import { apiClient } from "../lib/api"

type THealthPayload = {
  client: string
  timestamp: string
  message: string
}

class HealthService {
  async postHealth(payload: THealthPayload) {
    const res = await apiClient.post("/health", payload) // POST JSON body
    return res.data
  }
}

export const healthService = new HealthService()
