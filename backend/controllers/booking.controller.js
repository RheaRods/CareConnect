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
