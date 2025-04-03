import { Service, Staff, TimeSlot, Appointment, BookAppointmentRequest, MCPResponse } from './types';
import { services, staff, appointments, generateTimeSlots } from './mockData';
import { v4 as uuidv4 } from 'uuid';

export class MCPServer {
  // Get all available services
  async getServices(): Promise<MCPResponse<Service[]>> {
    try {
      return {
        status: 'success',
        data: services
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Failed to fetch services'
      };
    }
  }

  // Get staff members for a specific service
  async getStaffForService(serviceId: string): Promise<MCPResponse<Staff[]>> {
    try {
      const availableStaff = staff.filter(s => s.serviceIds.includes(serviceId));
      return {
        status: 'success',
        data: availableStaff
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Failed to fetch staff'
      };
    }
  }

  // Get availability for a specific staff member and service
  async getAvailability(
    staffId: string,
    serviceId: string,
    date: string
  ): Promise<MCPResponse<TimeSlot[]>> {
    try {
      const selectedStaff = staff.find(s => s.id === staffId);
      const selectedService = services.find(s => s.id === serviceId);

      if (!selectedStaff || !selectedService) {
        return {
          status: 'error',
          error: 'Invalid staff or service ID'
        };
      }

      const dateObj = new Date(date);
      const availableSlots = generateTimeSlots(dateObj);
      
      // Filter out slots that conflict with existing appointments
      const bookedSlots = appointments.filter(
        apt => apt.staffId === staffId && 
        new Date(apt.startTime).toDateString() === dateObj.toDateString()
      );

      const timeSlots: TimeSlot[] = availableSlots.map(slot => {
        const startTime = new Date(slot);
        const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
        
        const isBooked = bookedSlots.some(apt => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          return (startTime >= aptStart && startTime < aptEnd) ||
                 (endTime > aptStart && endTime <= aptEnd);
        });

        return {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          staffId,
          serviceId,
          available: !isBooked
        };
      });

      return {
        status: 'success',
        data: timeSlots
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Failed to fetch availability'
      };
    }
  }

  // Book an appointment
  async bookAppointment(request: BookAppointmentRequest): Promise<MCPResponse<Appointment>> {
    try {
      const { serviceId, staffId, startTime, customerId } = request;
      
      // Validate service and staff
      const selectedService = services.find(s => s.id === serviceId);
      const selectedStaff = staff.find(s => s.id === staffId);

      if (!selectedService || !selectedStaff) {
        return {
          status: 'error',
          error: 'Invalid service or staff ID'
        };
      }

      // Calculate end time
      const startDateTime = new Date(startTime);
      const endDateTime = new Date(startDateTime.getTime() + selectedService.duration * 60000);

      // Check if the slot is available
      const availability = await this.getAvailability(
        staffId,
        serviceId,
        startDateTime.toISOString()
      );

      if (availability.status === 'error' || !availability.data) {
        return {
          status: 'error',
          error: 'Failed to verify availability'
        };
      }

      const isSlotAvailable = availability.data.some(
        slot => slot.startTime === startTime && slot.available
      );

      if (!isSlotAvailable) {
        return {
          status: 'error',
          error: 'Selected time slot is not available'
        };
      }

      // Create new appointment
      const appointment: Appointment = {
        id: uuidv4(),
        serviceId,
        staffId,
        customerId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: 'confirmed'
      };

      appointments.push(appointment);

      return {
        status: 'success',
        data: appointment
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Failed to book appointment'
      };
    }
  }
} 