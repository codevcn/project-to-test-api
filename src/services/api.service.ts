import { apiClient } from "../lib/api"

type TSupportedHttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

type TApiRequestConfig = {
  url: string
  method: TSupportedHttpMethod
  data?: Record<string, any>
  signal?: AbortSignal
}

class ApiService {
  async sendRequest(config: TApiRequestConfig) {
    const { url, method, data, signal } = config

    switch (method) {
      case "GET":
        return await apiClient.get(url, { signal })
      case "POST":
        return await apiClient.post(url, data, { signal })
      case "PUT":
        return await apiClient.put(url, data, { signal })
      case "DELETE":
        return await apiClient.delete(url, { data, signal })
      case "PATCH":
        return await apiClient.patch(url, data, { signal })
      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }
  }
}

export const apiService = new ApiService()
export type { TSupportedHttpMethod, TApiRequestConfig }
