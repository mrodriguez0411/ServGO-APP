export interface ServiceProvider {
  id: string
  name: string
  avatar?: string
  rating: number
  reviewCount: number
  services: string[]
  location: string
  distance: number
  hourlyRate: number
  isVerified: boolean
  isAvailable: boolean
  description: string
  completedJobs: number
  responseTime: string
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  providerCount: number
}

export interface ServiceRequest {
  id: string
  title: string
  description: string
  category: string
  location: string
  budget: {
    min: number
    max: number
  }
  urgency: "low" | "medium" | "high"
  images?: string[]
  createdAt: string
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled"
  clientId: string
  providerId?: string
  scheduledDate?: string
  completedDate?: string
  clientName: string
  providerName?: string
}

export interface Job {
  id: string
  title: string
  description: string
  category: string
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled"
  clientId: string
  providerId: string
  clientName: string
  providerName: string
  location: string
  budget: {
    min: number
    max: number
    final?: number
  }
  scheduledDate: string
  createdAt: string
  completedDate?: string
  urgency: "low" | "medium" | "high"
  images?: string[]
}

export interface Review {
  id: string
  jobId: string
  clientId: string
  providerId: string
  clientName: string
  providerName: string
  rating: number
  comment: string
  createdAt: string
  images?: string[]
}
