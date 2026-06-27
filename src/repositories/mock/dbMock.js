// Mock Database Engine using LocalStorage
import { addDays, format, parse, startOfDay, eachDayOfInterval } from 'date-fns';

const DB_KEY = 'zsports_db';

const INITIAL_VENUES = [
  {
    id: 'venue-1',
    name: 'Elite Turf & Arena',
    slug: 'elite-turf-and-arena',
    description: 'Premier sports destination offering top-tier turf facilities for football and cricket. Standard dimensions, professional floodlights, changing rooms, and a cafe are available on-site.',
    address: 'Plot 45, Sector 4, Opposite Phoenix Mall, Lower Parel',
    city: 'Mumbai',
    pincode: '400013',
    state: 'Maharashtra',
    location: { lat: 18.9928, lng: 72.8294 },
    phone: '9876543210',
    email: 'info@eliteturf.com',
    sports: ['Football Turf', 'Cricket Turf', 'Cricket Nets'],
    amenities: ['Parking', 'Changing Rooms', 'Floodlights', 'Cafeteria', 'Restrooms', 'WiFi'],
    coverImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=600'
    ],
    openingHours: {
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:59', isOpen: true },
      sunday: { open: '06:00', close: '23:59', isOpen: true }
    },
    avgRating: 4.8,
    reviewCount: 24,
    totalBookings: 142,
    adminId: 'user-admin',
    isActive: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'venue-2',
    name: 'Golden Badminton Club',
    slug: 'golden-badminton-club',
    description: 'State of the art indoor badminton facility with premium wooden flooring and synthetic mats, professional lighting, and individual court cooling systems.',
    address: 'Near Metro Station, Andheri East',
    city: 'Mumbai',
    pincode: '400069',
    state: 'Maharashtra',
    location: { lat: 19.1154, lng: 72.8727 },
    phone: '9876543211',
    email: 'play@goldenbadminton.com',
    sports: ['Badminton', 'Table Tennis'],
    amenities: ['Changing Rooms', 'Restrooms', 'Parking', 'WiFi'],
    coverImageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1200',
    galleryImageUrls: [
      'https://images.unsplash.com/photo-1521537634581-0dccd2ebd834?auto=format&fit=crop&q=80&w=600'
    ],
    openingHours: {
      monday: { open: '05:00', close: '22:00', isOpen: true },
      tuesday: { open: '05:00', close: '22:00', isOpen: true },
      wednesday: { open: '05:00', close: '22:00', isOpen: true },
      thursday: { open: '05:00', close: '22:00', isOpen: true },
      friday: { open: '05:00', close: '22:00', isOpen: true },
      saturday: { open: '05:00', close: '23:00', isOpen: true },
      sunday: { open: '05:00', close: '23:00', isOpen: true }
    },
    avgRating: 4.6,
    reviewCount: 18,
    totalBookings: 89,
    adminId: 'user-admin',
    isActive: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'venue-3',
    name: 'Downtown Smash Squash & Tennis',
    slug: 'downtown-smash-squash',
    description: 'Central hub for racquet sports in Delhi. Offering clay tennis courts and glass-back squash arenas with standard air-conditioning.',
    address: 'B-Block Connaught Place, near Central Park',
    city: 'Delhi',
    pincode: '110001',
    state: 'Delhi',
    location: { lat: 28.6304, lng: 77.2177 },
    phone: '9876543212',
    email: 'downtown@smashsports.com',
    sports: ['Tennis', 'Squash', 'Pickleball'],
    amenities: ['Parking', 'Changing Rooms', 'Floodlights', 'Restrooms', 'Cafeteria'],
    coverImageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=1200',
    galleryImageUrls: [],
    openingHours: {
      monday: { open: '06:00', close: '21:00', isOpen: true },
      tuesday: { open: '06:00', close: '21:00', isOpen: true },
      wednesday: { open: '06:00', close: '21:00', isOpen: true },
      thursday: { open: '06:00', close: '21:00', isOpen: true },
      friday: { open: '06:00', close: '21:00', isOpen: true },
      saturday: { open: '06:00', close: '22:00', isOpen: true },
      sunday: { open: '06:00', close: '20:00', isOpen: true }
    },
    avgRating: 4.5,
    reviewCount: 12,
    totalBookings: 65,
    adminId: 'user-admin-other',
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'venue-4',
    name: 'Active Life Multisport Center',
    slug: 'active-life-multisport',
    description: 'Indoor multisport facility hosting basketball leagues, volleyball matches, and competitive 5v5 futsal. Excellent quality flooring and spectator seating.',
    address: '12th Main Road, HSR Layout',
    city: 'Bangalore',
    pincode: '560102',
    state: 'Karnataka',
    location: { lat: 12.9141, lng: 77.6413 },
    phone: '9876543213',
    email: 'hsr@activelifesports.com',
    sports: ['Basketball', 'Volleyball', 'Futsal', 'Table Tennis'],
    amenities: ['Parking', 'Changing Rooms', 'Restrooms', 'WiFi', 'Floodlights'],
    coverImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
    galleryImageUrls: [],
    openingHours: {
      monday: { open: '06:00', close: '22:00', isOpen: true },
      tuesday: { open: '06:00', close: '22:00', isOpen: true },
      wednesday: { open: '06:00', close: '22:00', isOpen: true },
      thursday: { open: '06:00', close: '22:00', isOpen: true },
      friday: { open: '06:00', close: '22:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '06:00', close: '22:00', isOpen: true }
    },
    avgRating: 4.7,
    reviewCount: 30,
    totalBookings: 198,
    adminId: 'user-admin',
    isActive: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'venue-5',
    name: 'Oceanic Swimming Academy',
    slug: 'oceanic-swimming-academy',
    description: 'Temperature-controlled Olympic size swimming pool with 8 professional lanes, qualified coaches, and separate lockers/changing zones for men and women.',
    address: 'Link Road, Bandra West',
    city: 'Mumbai',
    pincode: '400050',
    state: 'Maharashtra',
    location: { lat: 19.0607, lng: 72.8362 },
    phone: '9876543214',
    email: 'swim@oceanicacademy.com',
    sports: ['Swimming'],
    amenities: ['Parking', 'Changing Rooms', 'Restrooms', 'Cafeteria'],
    coverImageUrl: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=1200',
    galleryImageUrls: [],
    openingHours: {
      monday: { open: '06:00', close: '21:00', isOpen: true },
      tuesday: { open: '06:00', close: '21:00', isOpen: true },
      wednesday: { open: '06:00', close: '21:00', isOpen: true },
      thursday: { open: '06:00', close: '21:00', isOpen: true },
      friday: { open: '06:00', close: '21:00', isOpen: true },
      saturday: { open: '06:00', close: '20:00', isOpen: true },
      sunday: { open: '07:00', close: '13:00', isOpen: true }
    },
    avgRating: 4.4,
    reviewCount: 15,
    totalBookings: 52,
    adminId: 'user-admin',
    isActive: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_COURTS = [
  {
    id: 'court-1',
    venueId: 'venue-1',
    venueName: 'Elite Turf & Arena',
    name: 'Wembley Turf A (5v5)',
    sport: 'Football Turf',
    surfaceType: 'AstroTurf',
    capacity: 10,
    description: 'High-quality shock absorption turf ideal for competitive 5-a-side football matches. Surrounded by rebound nets.',
    imageUrls: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=600'],
    baseHourlyRate: 1200,
    peakHourlyRate: 1800,
    weekendRate: 1500,
    slotDurationMinutes: 60,
    peakHours: { start: '17:00', end: '22:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'court-2',
    venueId: 'venue-1',
    venueName: 'Elite Turf & Arena',
    name: 'Lord’s Cricket Net A',
    sport: 'Cricket Nets',
    surfaceType: 'Artificial Turf',
    capacity: 6,
    description: 'Enclosed nets with bowling machines available. Perfect for batting practice and drills.',
    imageUrls: ['https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600'],
    baseHourlyRate: 600,
    peakHourlyRate: 900,
    weekendRate: 800,
    slotDurationMinutes: 60,
    peakHours: { start: '16:00', end: '21:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'court-3',
    venueId: 'venue-2',
    venueName: 'Golden Badminton Club',
    name: 'Supreme Court 1 (Synthetic)',
    sport: 'Badminton',
    surfaceType: 'Yonex Mat',
    capacity: 4,
    description: 'Professional Yonex green mat court over wooden base, providing excellent traction and knee safety.',
    imageUrls: ['https://images.unsplash.com/photo-1521537634581-0dccd2ebd834?auto=format&fit=crop&q=80&w=600'],
    baseHourlyRate: 350,
    peakHourlyRate: 500,
    weekendRate: 450,
    slotDurationMinutes: 60,
    peakHours: { start: '18:00', end: '21:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'court-4',
    venueId: 'venue-2',
    venueName: 'Golden Badminton Club',
    name: 'Supreme Court 2 (Wooden)',
    sport: 'Badminton',
    surfaceType: 'Teak Wood',
    capacity: 4,
    description: 'Polished teak wooden badminton court with standard anti-glare overhead lights.',
    imageUrls: [],
    baseHourlyRate: 300,
    peakHourlyRate: 450,
    weekendRate: 400,
    slotDurationMinutes: 60,
    peakHours: { start: '18:00', end: '21:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'court-5',
    venueId: 'venue-3',
    venueName: 'Downtown Smash Squash & Tennis',
    name: 'Clay Court A',
    sport: 'Tennis',
    surfaceType: 'Red Clay',
    capacity: 4,
    description: 'Standard clay tennis court mimicking French Open playing speed. Floodlit for night sessions.',
    imageUrls: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600'],
    baseHourlyRate: 800,
    peakHourlyRate: 1200,
    weekendRate: 1000,
    slotDurationMinutes: 60,
    peakHours: { start: '17:00', end: '21:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'court-6',
    venueId: 'venue-4',
    venueName: 'Active Life Multisport Center',
    name: 'Indoor Arena Court 1',
    sport: 'Basketball',
    surfaceType: 'Hardwood Maple',
    capacity: 15,
    description: 'Championship grade maple court with adjustable hoops and electronic scoreboards.',
    imageUrls: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600'],
    baseHourlyRate: 1000,
    peakHourlyRate: 1500,
    weekendRate: 1200,
    slotDurationMinutes: 60,
    peakHours: { start: '17:00', end: '22:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'court-7',
    venueId: 'venue-5',
    venueName: 'Oceanic Swimming Academy',
    name: 'Olympic Lane 1',
    sport: 'Swimming',
    surfaceType: 'Water',
    capacity: 2,
    description: 'Indoor lane reserved for lap swimming and professional practice. Starting blocks available.',
    imageUrls: [],
    baseHourlyRate: 400,
    peakHourlyRate: 600,
    weekendRate: 500,
    slotDurationMinutes: 60,
    peakHours: { start: '06:00', end: '09:00' },
    isActive: true,
    isUnderMaintenance: false,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_USERS = [
  {
    uid: 'user-customer',
    displayName: 'Sam Williams',
    email: 'customer@zsports.com',
    phone: '9876543220',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    role: 'customer',
    favoriteVenueIds: ['venue-1', 'venue-2'],
    notificationPreferences: { email: true, inApp: true, sms: false },
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'user-admin',
    displayName: 'Arjun Mehta',
    email: 'admin@zsports.com',
    phone: '9876543221',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    venueId: 'venue-1',
    favoriteVenueIds: [],
    notificationPreferences: { email: true, inApp: true, sms: true },
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'user-staff',
    displayName: 'Rohan Sharma',
    email: 'staff@zsports.com',
    phone: '9876543222',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    role: 'staff',
    venueId: 'venue-1',
    favoriteVenueIds: [],
    notificationPreferences: { email: true, inApp: true, sms: false },
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'user-superadmin',
    displayName: 'Divya Rao',
    email: 'superadmin@zsports.com',
    phone: '9876543223',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    favoriteVenueIds: [],
    notificationPreferences: { email: true, inApp: true, sms: true },
    isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_COUPONS = [
  {
    id: 'coupon-1',
    code: 'ZSPORTS20',
    description: 'Get 20% discount on all bookings!',
    discountType: 'percentage',
    discountValue: 20,
    minimumBookingAmount: 500,
    maximumDiscountAmount: 300,
    validFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    validTo: addDays(new Date(), 30).toISOString(),
    totalUsageLimit: 500,
    perCustomerLimit: 2,
    currentUsageCount: 42,
    applicableSports: [],
    applicableVenueIds: [],
    venueId: 'venue-1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'coupon-2',
    code: 'WELCOME50',
    description: 'Flat ₹50 discount for first time users.',
    discountType: 'fixed',
    discountValue: 50,
    minimumBookingAmount: 200,
    maximumDiscountAmount: 50,
    validFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    validTo: addDays(new Date(), 15).toISOString(),
    totalUsageLimit: 1000,
    perCustomerLimit: 1,
    currentUsageCount: 156,
    applicableSports: [],
    applicableVenueIds: [],
    venueId: 'venue-1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_SETTINGS = [
  {
    venueId: 'venue-1',
    cancellationPolicy: { fullRefundHours: 24, partialRefundHours: 12, partialRefundPercent: 50 },
    bookingHoldMinutes: 10,
    advanceBookingDays: 14,
    minBookingHours: 2,
    autoConfirm: true,
    requirePhoneVerification: false,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    updatedAt: new Date().toISOString()
  },
  {
    venueId: 'venue-2',
    cancellationPolicy: { fullRefundHours: 12, partialRefundHours: 6, partialRefundPercent: 50 },
    bookingHoldMinutes: 10,
    advanceBookingDays: 7,
    minBookingHours: 1,
    autoConfirm: true,
    requirePhoneVerification: false,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    bookingId: 'book-seed-1',
    customerId: 'user-customer',
    customerName: 'Sam Williams',
    customerAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    venueId: 'venue-1',
    courtId: 'court-1',
    rating: 5,
    comment: 'Absolutely love the grass quality here! The floodlights are super bright and make evening matches feel professional. Very easy check-in.',
    tags: ['Excellent Turf', 'Floodlights', 'Friendly Staff'],
    isVisible: true,
    isFlagged: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rev-2',
    bookingId: 'book-seed-2',
    customerId: 'user-customer',
    customerName: 'Sam Williams',
    customerAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    venueId: 'venue-2',
    courtId: 'court-3',
    rating: 4,
    comment: 'Great courts but pricing is slightly higher during peak hours. Changing rooms were clean.',
    tags: ['Good Amenities', 'Synthetic Courts'],
    isVisible: true,
    isFlagged: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class MockDB {
  constructor() {
    this._initDB();
  }

  _initDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const data = {
        users: INITIAL_USERS,
        venues: INITIAL_VENUES,
        courts: INITIAL_COURTS,
        slots: [], // slots will be generated on load to match current date
        bookings: [],
        payments: [],
        reviews: INITIAL_REVIEWS,
        coupons: INITIAL_COUPONS,
        couponUsages: [],
        notifications: [],
        settings: INITIAL_SETTINGS,
        reports: []
      };

      // Seed historical bookings & slots
      this._seedHistoricalData(data);
      this._save(data);
    } else {
      // Auto-generate forward slots for active courts to ensure bookable slots exist
      const data = JSON.parse(raw);
      this._generateForwardSlots(data);
      this._save(data);
    }
  }

  _save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  _read() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  _seedHistoricalData(data) {
    // Generate bookings for the last 15 days
    const customer = INITIAL_USERS[0];
    const venues = INITIAL_VENUES;
    const courts = INITIAL_COURTS;
    const today = startOfDay(new Date());

    let bookingCounter = 1001;

    for (let i = 15; i >= 1; i--) {
      const targetDate = format(addDays(today, -i), 'yyyy-MM-dd');
      
      // Seed 2-3 completed bookings per day
      const dailyBookingCount = Math.floor(Math.random() * 2) + 2;
      for (let b = 0; b < dailyBookingCount; b++) {
        const venue = venues[b % venues.length];
        const court = courts.find(c => c.venueId === venue.id) || courts[0];
        const hour = 8 + (b * 3); // 8:00, 11:00, 14:00 etc
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const refNum = `BK${bookingCounter++}`;
        const subtotal = court.baseHourlyRate;
        const totalAmount = subtotal;

        const booking = {
          id: `book-seed-${bookingCounter}`,
          bookingRef: refNum,
          customerId: customer.uid,
          customerName: customer.displayName,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          venueId: venue.id,
          venueName: venue.name,
          courtId: court.id,
          courtName: court.name,
          sport: court.sport,
          date: targetDate,
          startTime,
          endTime,
          slotIds: [`slot-hist-${bookingCounter}`],
          totalSlots: 1,
          subtotal,
          discountAmount: 0,
          couponCode: null,
          totalAmount,
          status: Math.random() > 0.08 ? 'completed' : 'cancelled',
          paymentId: `pay-${bookingCounter}`,
          paymentStatus: 'paid',
          paymentMethod: 'UPI',
          checkedIn: true,
          checkedInAt: new Date(`${targetDate}T${startTime}:00Z`).toISOString(),
          checkedInBy: 'user-staff',
          isWalkIn: Math.random() > 0.8,
          createdAt: new Date(`${targetDate}T09:00:00Z`).toISOString(),
          updatedAt: new Date().toISOString()
        };

        const payment = {
          id: `pay-${bookingCounter}`,
          bookingId: booking.id,
          customerId: customer.uid,
          venueId: venue.id,
          razorpayOrderId: `order_seed_${bookingCounter}`,
          razorpayPaymentId: `pay_seed_${bookingCounter}`,
          razorpaySignature: `sig_seed_${bookingCounter}`,
          amount: totalAmount,
          currency: 'INR',
          status: 'paid',
          createdAt: booking.createdAt,
          updatedAt: booking.createdAt
        };

        data.bookings.push(booking);
        data.payments.push(payment);
      }
    }

    // Seed 3 upcoming bookings for Sam Williams
    const upcoming1 = format(addDays(today, 1), 'yyyy-MM-dd');
    const upcoming2 = format(addDays(today, 2), 'yyyy-MM-dd');

    const seedUpcoming = [
      { id: 'up-1', date: upcoming1, start: '18:00', end: '19:00', courtId: 'court-1', venueId: 'venue-1' },
      { id: 'up-2', date: upcoming2, start: '10:00', end: '11:00', courtId: 'court-3', venueId: 'venue-2' }
    ];

    seedUpcoming.forEach((up, idx) => {
      const court = courts.find(c => c.id === up.courtId);
      const venue = venues.find(v => v.id === up.venueId);
      const isPeak = up.start >= court.peakHours.start && up.start < court.peakHours.end;
      const price = isPeak ? court.peakHourlyRate : court.baseHourlyRate;

      data.bookings.push({
        id: `book-up-${idx}`,
        bookingRef: `BKUP800${idx}`,
        customerId: customer.uid,
        customerName: customer.displayName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        venueId: venue.id,
        venueName: venue.name,
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        date: up.date,
        startTime: up.start,
        endTime: up.end,
        slotIds: [`slot-up-${idx}`],
        totalSlots: 1,
        subtotal: price,
        discountAmount: 0,
        couponCode: null,
        totalAmount: price,
        status: 'confirmed',
        paymentId: `pay-up-${idx}`,
        paymentStatus: 'paid',
        paymentMethod: 'Card',
        checkedIn: false,
        isWalkIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      data.payments.push({
        id: `pay-up-${idx}`,
        bookingId: `book-up-${idx}`,
        customerId: customer.uid,
        venueId: venue.id,
        razorpayOrderId: `order_up_${idx}`,
        razorpayPaymentId: `pay_up_${idx}`,
        razorpaySignature: `sig_up_${idx}`,
        amount: price,
        currency: 'INR',
        status: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Add as slot
      data.slots.push({
        id: `slot-up-${idx}`,
        courtId: court.id,
        venueId: venue.id,
        date: up.date,
        startTime: up.start,
        endTime: up.end,
        durationMinutes: 60,
        price,
        isPeakHour: isPeak,
        isWeekend: false,
        status: 'booked',
        bookedByUserId: customer.uid,
        bookingId: `book-up-${idx}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Populate dynamic slots
    this._generateForwardSlots(data);
  }

  _generateForwardSlots(data) {
    const today = startOfDay(new Date());
    const courts = data.courts;
    const venues = data.venues;
    const currentSlots = data.slots;

    // We generate slots from today to today + 7 days
    const days = eachDayOfInterval({ start: today, end: addDays(today, 7) });

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sun = 0, Sat = 6

      courts.forEach(court => {
        const venue = venues.find(v => v.id === court.venueId);
        if (!venue || !venue.isActive || !court.isActive) return;

        // Get opening hours for this day of week
        const dayName = format(day, 'EEEE').toLowerCase(); // e.g. 'monday'
        const hours = venue.openingHours[dayName];
        if (!hours || !hours.isOpen) return;

        const openHour = parseInt(hours.open.split(':')[0]);
        const closeHour = parseInt(hours.close.split(':')[0]);

        const duration = court.slotDurationMinutes; // usually 60 mins
        
        for (let hour = openHour; hour < closeHour; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

          // Check if slot already exists
          const exists = currentSlots.some(s => s.courtId === court.id && s.date === dateStr && s.startTime === startTime);
          if (exists) return;

          // Determine price
          let price = court.baseHourlyRate;
          const peakStart = court.peakHours.start;
          const peakEnd = court.peakHours.end;
          const isPeak = startTime >= peakStart && startTime < peakEnd;

          if (isWeekend) {
            price = court.weekendRate;
          } else if (isPeak) {
            price = court.peakHourlyRate;
          }

          // Randomize status for seed availability (exclude today's historical slots)
          let status = 'available';
          const randomVal = Math.random();
          if (randomVal > 0.85) {
            status = 'blocked';
          }

          currentSlots.push({
            id: `slot-${court.id}-${dateStr}-${startTime.replace(':', '')}`,
            courtId: court.id,
            venueId: court.venueId,
            date: dateStr,
            startTime,
            endTime,
            durationMinutes: duration,
            price,
            isPeakHour: isPeak,
            isWeekend,
            status,
            holdByUserId: null,
            holdExpiresAt: null,
            bookedByUserId: null,
            bookingId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
    });
  }

  // Repository access helpers
  getTable(tableName) {
    const data = this._read();
    return data[tableName] || [];
  }

  saveTable(tableName, rows) {
    const data = this._read();
    data[tableName] = rows;
    this._save(data);
  }

  getById(tableName, id) {
    const rows = this.getTable(tableName);
    return rows.find(r => r.id === id || r.uid === id) || null;
  }

  insert(tableName, row) {
    const rows = this.getTable(tableName);
    const newRow = { 
      id: row.id || row.uid || Math.random().toString(36).substring(2, 9), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...row 
    };
    rows.push(newRow);
    this.saveTable(tableName, rows);
    return newRow;
  }

  update(tableName, id, updates) {
    const rows = this.getTable(tableName);
    let updatedRow = null;
    const index = rows.findIndex(r => r.id === id || r.uid === id);
    if (index !== -1) {
      updatedRow = { ...rows[index], ...updates, updatedAt: new Date().toISOString() };
      rows[index] = updatedRow;
      this.saveTable(tableName, rows);
    }
    return updatedRow;
  }

  delete(tableName, id) {
    let rows = this.getTable(tableName);
    const deleted = rows.some(r => r.id === id || r.uid === id);
    rows = rows.filter(r => r.id !== id && r.uid !== id);
    this.saveTable(tableName, rows);
    return deleted;
  }
}

export const dbMock = new MockDB();
export default dbMock;
