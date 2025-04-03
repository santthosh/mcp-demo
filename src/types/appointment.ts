export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface Staff {
  id: string;
  name: string;
  serviceIds: string[];
  availability: {
    [key: string]: string[]; // day -> available time slots
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  staffId: string;
  serviceId: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface BookAppointmentRequest {
  serviceId: string;
  staffId: string;
  startTime: string;
  customerId: string;
} 