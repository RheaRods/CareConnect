import prisma from '../lib/prisma.js'

// POST /api/bookings
export async function createBooking(req, res) {
  try {
    const { caretakerId, startDate, endDate } = req.body

    const careSeeker = await prisma.careSeeker.findUnique({
      where: { userId: req.user.id },
    })
    if (!careSeeker) return res.status(404).json({ error: 'CareSeeker profile not found' })

    const caretaker = await prisma.caretaker.findUnique({
      where: { id: parseInt(caretakerId) },
    })
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' })

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time provided' })
    }
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' })
    }

    const startDay = new Date(start)
    startDay.setUTCHours(0, 0, 0, 0)
    const endDay = new Date(end)
    endDay.setUTCHours(0, 0, 0, 0)

    const newHour = start.getUTCHours()
    const newMin  = start.getUTCMinutes()

    const candidates = await prisma.booking.findMany({
      where: {
        caretakerId: caretaker.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [
          { startDate: { lt: endDay } },
          { endDate:   { gt: startDay } },
        ],
      },
    })

    const overlap = candidates.find(b =>
      b.startDate.getUTCHours()   === newHour &&
      b.startDate.getUTCMinutes() === newMin
    )

    if (overlap) {
      return res.status(409).json({ error: 'Caretaker is already booked for this time period' })
    }

    const hours = (end - start) / (1000 * 60 * 60)
    const totalCost = hours * caretaker.hourlyRate

    const booking = await prisma.booking.create({
      data: {
        caretakerId: caretaker.id,
        careSeekerId: careSeeker.id,
        startDate: start,
        endDate: end,
        status: 'PENDING',
        totalCost,
      },
      include: {
        caretaker: { include: { user: { select: { name: true, email: true } } } },
        careSeeker: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    res.status(201).json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/bookings
export async function getMyBookings(req, res) {
  try {
    let bookings

    if (req.user.role === 'CARETAKER') {
      const caretaker = await prisma.caretaker.findUnique({ where: { userId: req.user.id } })
      if (!caretaker) return res.status(404).json({ error: 'Caretaker profile not found' })

      bookings = await prisma.booking.findMany({
        where: { caretakerId: caretaker.id },
        include: {
          careSeeker: { include: { user: { select: { name: true, email: true } } } },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      const careSeeker = await prisma.careSeeker.findUnique({ where: { userId: req.user.id } })
      if (!careSeeker) return res.status(404).json({ error: 'CareSeeker profile not found' })

      bookings = await prisma.booking.findMany({
        where: { careSeekerId: careSeeker.id },
        include: {
          caretaker: { include: { user: { select: { name: true, email: true } } } },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    res.json(bookings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/bookings/:id
export async function getBooking(req, res) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        caretaker: { include: { user: { select: { name: true, email: true } } } },
        careSeeker: { include: { user: { select: { name: true, email: true } } } },
        review: true,
      },
    })

    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/bookings/:id/status
export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body
    const bookingId = parseInt(req.params.id)

    if (!status) return res.status(400).json({ error: 'Status is required' })

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    const allowedTransitions = {
      CARETAKER: ['CONFIRMED', 'CANCELLED', 'COMPLETED'],
      CARESEEKER: ['CANCELLED'],
    }

    if (!allowedTransitions[req.user.role]?.includes(status)) {
      return res.status(403).json({ error: `Your role cannot set status to ${status}` })
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}