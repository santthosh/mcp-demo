import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import type { Service, Staff, TimeSlot, Appointment } from '@/types/appointment';

// Initialize MCP server
const mcp = new McpServer({
  name: 'appointment-booking',
  version: '1.0.0'
}, {
  capabilities: {
    tools: true
  }
});

// Mock data store - in a real app, this would be a database
const services: Service[] = [
  {
    id: '1',
    name: 'Haircut',
    description: 'Basic haircut service',
    duration: 30,
    price: 30.00
  },
  {
    id: '2',
    name: 'Hair Coloring',
    description: 'Full hair coloring service',
    duration: 120,
    price: 120.00
  }
];

const staff: Staff[] = [
  {
    id: '1',
    name: 'John Doe',
    serviceIds: ['1', '2'],
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00']
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    serviceIds: ['1'],
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00']
    }
  }
];

const appointments: Appointment[] = [];

// Register tools
mcp.tool('getBookableServices', 'Get a list of available services that can be booked', {}, async () => {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(services)
      }
    ]
  };
});

mcp.tool('getStaffForService', 'Get available staff members for a specific service', {
  serviceId: z.string().describe('The ID of the service to find staff for')
}, async (params) => {
  const matchingStaff = staff.filter(s => s.serviceIds.includes(params.serviceId));
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(matchingStaff)
      }
    ]
  };
});

mcp.tool('getAvailableTimeSlots', 'Get available time slots for a specific service and staff member', {
  serviceId: z.string().describe('The ID of the service'),
  staffId: z.string().describe('The ID of the staff member'),
  date: z.string().describe('The date to check availability for (format: YYYY-MM-DD)')
}, async (params) => {
  const staffMember = staff.find(s => s.id === params.staffId);
  if (!staffMember) {
    throw new Error('Staff member not found');
  }

  // Get day of week from date
  const dayOfWeek = new Date(params.date).toLocaleString('en-US', { weekday: 'long' });
  const availableSlots = staffMember.availability[dayOfWeek] || [];

  // Filter out slots that are already booked
  const bookedSlots = appointments.filter(
    a => a.staffId === params.staffId && 
         a.startTime.startsWith(params.date) &&
         a.status === 'confirmed'
  );

  const slots = availableSlots.filter(slot => {
    return !bookedSlots.some(booking => booking.startTime === `${params.date}T${slot}:00`);
  }).map(slot => ({
    startTime: `${params.date}T${slot}:00`,
    endTime: `${params.date}T${slot}:00`, // You would calculate this based on service duration
    staffId: params.staffId,
    serviceId: params.serviceId
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(slots)
      }
    ]
  };
});

mcp.tool('bookAppointment', 'Book an appointment for a service with a staff member', {
  serviceId: z.string().describe('The ID of the service'),
  staffId: z.string().describe('The ID of the staff member'),
  startTime: z.string().describe('The start time of the appointment (format: YYYY-MM-DDTHH:mm:ss)'),
  customerId: z.string().describe('The ID of the customer')
}, async (params) => {
  // Check if slot is available
  const date = params.startTime.split('T')[0];
  const time = params.startTime.split('T')[1].slice(0, 5);
  
  const staffMember = staff.find(s => s.id === params.staffId);
  if (!staffMember) {
    throw new Error('Staff member not found');
  }

  const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
  const availableSlots = staffMember.availability[dayOfWeek] || [];

  if (!availableSlots.includes(time)) {
    throw new Error('Time slot not available');
  }

  // Create appointment
  const appointment: Appointment = {
    id: Math.random().toString(36).substring(7),
    serviceId: params.serviceId,
    staffId: params.staffId,
    customerId: params.customerId,
    startTime: params.startTime,
    endTime: params.startTime, // You would calculate this based on service duration
    status: 'confirmed'
  };

  appointments.push(appointment);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(appointment)
      }
    ]
  };
});

// Export the MCP handler
export async function POST(req: Request) {
  const body = await req.json();
  return mcp.server.handleRequest(body);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return mcp.server.handleRequest(params);
} 