import { Service, Staff, Appointment } from './types';

export const services: Service[] = [
  {
    id: 'haircut',
    name: 'Haircut',
    description: 'Standard haircut service',
    duration: 30,
    price: 30.00
  },
  {
    id: 'coloring',
    name: 'Hair Coloring',
    description: 'Professional hair coloring service',
    duration: 120,
    price: 120.00
  }
];

export const staff: Staff[] = [
  {
    id: 'staff1',
    name: 'John Doe',
    title: 'Senior Stylist',
    serviceIds: ['haircut', 'coloring']
  },
  {
    id: 'staff2',
    name: 'Jane Smith',
    title: 'Master Stylist',
    serviceIds: ['haircut', 'coloring']
  }
];

export const appointments: Appointment[] = [];

// Helper function to generate available time slots
export function generateTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date(date);
      time.setHours(hour, minute, 0, 0);
      slots.push(time.toISOString());
    }
  }
  
  return slots;
} 