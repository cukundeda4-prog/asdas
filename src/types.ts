export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Scheduled' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
  aircraft: string;
  availableSeats: number;
  price: number;
}

export interface Booking {
  id: string;
  flightId: string;
  passengerName: string;
  robloxUsername: string;
  seatNumber: string;
  bookingDate: string;
}
