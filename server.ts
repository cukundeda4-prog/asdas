import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

interface Flight {
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

interface Booking {
  id: string;
  flightId: string;
  passengerName: string;
  robloxUsername: string;
  seatNumber: string;
  bookingDate: string;
}

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData = {
      flights: [
        {
          id: uuidv4(),
          flightNumber: 'AC101',
          origin: 'Toronto (YYZ)',
          destination: 'Vancouver (YVR)',
          departureTime: '10:00',
          arrivalTime: '12:30',
          status: 'Scheduled',
          aircraft: 'Boeing 787-9',
          availableSeats: 48,
          price: 450
        },
        {
          id: uuidv4(),
          flightNumber: 'AC808',
          origin: 'Montreal (YUL)',
          destination: 'London (LHR)',
          departureTime: '18:45',
          arrivalTime: '06:30',
          status: 'Scheduled',
          aircraft: 'Airbus A330-300',
          availableSeats: 32,
          price: 890
        }
      ],
      bookings: []
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

async function getDb() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function saveDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  await ensureDb();
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/flights', async (req, res) => {
    const db = await getDb();
    res.json(db.flights);
  });

  app.post('/api/flights', async (req, res) => {
    const db = await getDb();
    const newFlight = { ...req.body, id: uuidv4() };
    db.flights.push(newFlight);
    await saveDb(db);
    res.json(newFlight);
  });

  app.put('/api/flights/:id', async (req, res) => {
    const db = await getDb();
    const index = db.flights.findIndex((f: any) => f.id === req.params.id);
    if (index !== -1) {
      db.flights[index] = { ...db.flights[index], ...req.body };
      await saveDb(db);
      res.json(db.flights[index]);
    } else {
      res.status(404).send('Flight not found');
    }
  });

  app.delete('/api/flights/:id', async (req, res) => {
    const db = await getDb();
    db.flights = db.flights.filter((f: any) => f.id !== req.params.id);
    await saveDb(db);
    res.status(204).send();
  });

  app.get('/api/bookings', async (req, res) => {
    const db = await getDb();
    res.json(db.bookings);
  });

  app.post('/api/bookings', async (req, res) => {
    const db = await getDb();
    const newBooking = { 
      ...req.body, 
      id: uuidv4(),
      bookingDate: new Date().toISOString()
    };
    
    // Decrease available seats
    const flightIndex = db.flights.findIndex((f: any) => f.id === newBooking.flightId);
    if (flightIndex !== -1 && db.flights[flightIndex].availableSeats > 0) {
      db.flights[flightIndex].availableSeats -= 1;
      db.bookings.push(newBooking);
      await saveDb(db);
      res.json(newBooking);
    } else {
      res.status(400).send('No seats available or flight not found');
    }
  });

  app.delete('/api/bookings/:id', async (req, res) => {
    const db = await getDb();
    const bookingToDelete = db.bookings.find((b: any) => b.id === req.params.id);
    if (bookingToDelete) {
      // Restore seat
      const flightIndex = db.flights.findIndex((f: any) => f.id === bookingToDelete.flightId);
      if (flightIndex !== -1) {
        db.flights[flightIndex].availableSeats += 1;
      }
      db.bookings = db.bookings.filter((b: any) => b.id !== req.params.id);
      await saveDb(db);
      res.status(204).send();
    } else {
      res.status(404).send('Booking not found');
    }
  });

  // Admin Login (Simple for this context)
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    // In a real app, this would be more secure. For this demo, we'll use a fixed code or just allow it.
    if (password === 'PTFS2026') {
      res.json({ success: true, token: 'admin-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
