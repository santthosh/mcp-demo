export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  serviceIds: string[]; // services they can perform
}

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
  staffId: string;
  serviceId: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface BookAppointmentRequest {
  serviceId: string;
  staffId: string;
  startTime: string;
  customerId: string;
}

export interface MCPResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
} 