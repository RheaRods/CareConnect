import prisma from '../lib/prisma.js'

// GET /api/caretakers
export async function listCaretakers(req, res) {
  try {
    const { availability, maxRate, minRate } = req.query

    const caretakers = await prisma.caretaker.findMany({
      where: {
        verificationStatus: 'APPROVED',
        ...(availability && { availability }),
        ...(maxRate && { hourlyRate: { lte: parseFloat(maxRate) } }),
        ...(minRate && { hourlyRate: { gte: parseFloat(minRate) } }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviews: { select: { rating: true } },
      },
    })

    const result = caretakers.map((ct) => ({
      ...ct,
      averageRating:
        ct.reviews.length > 0
          ? ct.reviews.reduce((sum, r) => sum + r.rating, 0) / ct.reviews.length
          : null,
      totalReviews: ct.reviews.length,
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/caretakers/:id
export async function getCaretaker(req, res) {
  try {
    const caretaker = await prisma.caretaker.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviews: {
          include: {
            careSeeker: {
              include: { user: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' })

    const averageRating =
      caretaker.reviews.length > 0
        ? caretaker.reviews.reduce((sum, r) => sum + r.rating, 0) / caretaker.reviews.length
        : null

    res.json({ ...caretaker, averageRating })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/caretakers/profile
export async function updateCaretakerProfile(req, res) {
  try {
    const { bio, hourlyRate, availability } = req.body

    const caretaker = await prisma.caretaker.update({
      where: { userId: req.user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(availability !== undefined && { availability }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    res.json(caretaker)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
