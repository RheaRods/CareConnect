import prisma from '../lib/prisma.js'

// GET /api/careseekers/profile
export async function getMyProfile(req, res) {
  try {
    const careSeeker = await prisma.careSeeker.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            caretaker: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    })

    if (!careSeeker) return res.status(404).json({ error: 'CareSeeker profile not found' })
    res.json(careSeeker)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/careseekers/profile
export async function updateMyProfile(req, res) {
  try {
    const { address, notes } = req.body

    const careSeeker = await prisma.careSeeker.update({
      where: { userId: req.user.id },
      data: {
        ...(address !== undefined && { address }),
        ...(notes !== undefined && { notes }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    res.json(careSeeker)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
