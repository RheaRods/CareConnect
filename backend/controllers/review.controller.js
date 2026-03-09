import prisma from '../lib/prisma.js'

// POST /api/reviews
export async function createReview(req, res) {
  try {
    const { bookingId, rating, comment } = req.body

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { careSeeker: true },
    })

    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review a COMPLETED booking' })
    }

    const careSeeker = await prisma.careSeeker.findUnique({ where: { userId: req.user.id } })
    if (booking.careSeekerId !== careSeeker.id) {
      return res.status(403).json({ error: 'You did not make this booking' })
    }

    const existing = await prisma.review.findUnique({ where: { bookingId: booking.id } })
    if (existing) return res.status(409).json({ error: 'Review already submitted for this booking' })

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        caretakerId: booking.caretakerId,
        careSeekerId: careSeeker.id,
        rating: parseInt(rating),
        comment,
      },
    })

    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/reviews/caretaker/:id
export async function getCaretakerReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { caretakerId: parseInt(req.params.id) },
      include: {
        careSeeker: { include: { user: { select: { name: true } } } },
        booking: { select: { startDate: true, endDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

    res.json({ reviews, averageRating: average, totalReviews: reviews.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
