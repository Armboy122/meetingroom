# Meeting Room Booking System

A modern meeting room booking system built with Next.js 14, TypeScript, Prisma, and PostgreSQL. Features a calendar view for booking rooms with Thai room names and real-time availability updates.

## Features

- 📅 **Calendar View**: Visual time-slot based booking system (8 AM - 6 PM)
- 🏢 **Room Grid View**: Overview of all rooms with current status
- 🇹🇭 **Thai Room Names**: 6 meeting rooms with Thai names and different capacities
- 👥 **Participant Management**: Add/remove meeting participants
- ⚡ **Real-time Updates**: Auto-refresh every 30 seconds
- 🔒 **Conflict Prevention**: Prevents double-booking
- 📱 **Responsive Design**: Works on desktop and mobile
- 🐳 **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Room Information

- **ห้องประชุมสยาม** - 12 people (Projector, Whiteboard, Sound system, Wi-Fi)
- **ห้องประชุมกรุงเทพ** - 8 people (55" TV, Whiteboard, Wi-Fi)
- **ห้องประชุมเชียงใหม่** - 16 people (Projector, Video conference, Whiteboard, Wi-Fi)
- **ห้องประชุมภูเก็ต** - 6 people (43" TV, Wi-Fi)
- **ห้องประชุมพัทยา** - 20 people (2 Projectors, Large sound system, 2 Whiteboards, Wi-Fi)
- **ห้องประชุมเกาะสมุย** - 4 people (32" Monitor, Wi-Fi)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose

### Production Deployment

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd meetingroom
   ```

2. Start the application:
   ```bash
   docker-compose up -d --build
   ```

3. Wait for the containers to start, then visit:
   - **Application**: http://localhost:3000
   - **Database**: PostgreSQL on port 5432

**That's it!** The system will automatically:
- ✅ Initialize the database
- ✅ Seed with 6 meeting rooms
- ✅ Start the application

### Update the project:
```bash
git pull && docker-compose up -d --build
```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up postgres -d
   ```

3. Set up the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Visit http://localhost:3000

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Seed the database with sample rooms
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## API Endpoints

- `GET /api/rooms` - Get all active rooms
- `GET /api/bookings?date=YYYY-MM-DD` - Get bookings for a specific date
- `POST /api/bookings` - Create a new booking
- `GET /api/participants?bookingId=ID` - Get participants for a booking
- `POST /api/participants` - Add a participant to a booking
- `DELETE /api/participants?participantId=ID` - Remove a participant

## Usage

### Calendar View

- Select a date using the navigation buttons
- Click on green (available) time slots to book
- Red slots indicate existing bookings
- Each slot is 30 minutes long

### Grid View

- Overview of all rooms with current status
- Shows current meetings and next scheduled meetings
- Click on any room card to open booking modal

### Creating a Booking

1. Click on an available time slot or room
2. Fill in the booking form:
   - Meeting title and organizer (required)
   - Description (optional)
   - Room selection
   - Start and end times
   - Add participants (optional)
3. Submit to create the booking

## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://admin:password123@localhost:5433/meeting_rooms"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Project Structure

```
meeting-room-booking/
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # Container build instructions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Sample data
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingModal.tsx
│   │   ├── ParticipantManager.tsx
│   │   └── RoomGrid.tsx
│   └── lib/
│       ├── prisma.ts     # Database client
│       └── utils.ts      # Utility functions
└── .env.local            # Environment variables
```

## Features in Detail

### Real-time Updates
- Calendar refreshes every 30 seconds
- Prevents stale data and booking conflicts

### Conflict Prevention
- Server-side validation prevents overlapping bookings
- Visual feedback for unavailable slots

### Responsive Design
- Mobile-friendly interface
- Touch-friendly interaction on tablets

### Participant Management
- Add multiple participants per meeting
- Optional email addresses
- Easy add/remove interface

## Development

### Adding New Features

1. Database changes: Update `prisma/schema.prisma`
2. API routes: Add to `src/app/api/`
3. Components: Add to `src/components/`
4. UI components: Use shadcn/ui patterns

### Running Tests

```bash
npm run lint
npm run build
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on port 5433
- Check DATABASE_URL in `.env.local`
- Run `docker-compose logs postgres` for database logs

### Build Issues
- Delete `node_modules` and run `npm install`
- Clear Next.js cache: `rm -rf .next`
- Regenerate Prisma client: `npm run db:generate`

### Port Conflicts
- PostgreSQL runs on port 5433 (not 5432)
- Next.js runs on port 3000
- Change ports in `docker-compose.yml` if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details