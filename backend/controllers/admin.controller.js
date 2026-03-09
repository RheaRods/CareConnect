import prisma from '../lib/prisma.js'

// GET /api/admin/caretakers/pending
export async function getPendingCaretakers(req, res) {
  try {
    const list = await prisma.caretaker.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/caretakers
export async function getAllCaretakers(req, res) {
  try {
    const list = await prisma.caretaker.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/admin/caretakers/:id/verify
export async function verifyCaretaker(req, res) {
  try {
    const { status } = req.body
    const id = parseInt(req.params.id)

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' })
    }

    const caretaker = await prisma.caretaker.findUnique({ where: { id } })
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' })

    const updated = await prisma.caretaker.update({
      where: { id },
      data: { verificationStatus: status, verifiedAt: new Date() },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    res.json({ message: `Caretaker ${status.toLowerCase()} successfully`, caretaker: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/users
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        caretaker: { select: { verificationStatus: true, hourlyRate: true } },
        careSeeker: { select: { address: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/admin/users/:id
export async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id)

    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { caretaker: true, careSeeker: true }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.caretaker) {
      const ctId = user.caretaker.id
      // Step 1: delete all reviews linked to this caretaker
      await prisma.review.deleteMany({ where: { caretakerId: ctId } })
      // Step 2: delete all bookings linked to this caretaker
      await prisma.booking.deleteMany({ where: { caretakerId: ctId } })
      // Step 3: delete the caretaker profile
      await prisma.caretaker.delete({ where: { id: ctId } })
    }

    if (user.careSeeker) {
      const csId = user.careSeeker.id
      // Step 1: delete all reviews made by this careseeker
      await prisma.review.deleteMany({ where: { careSeekerId: csId } })
      // Step 2: delete all bookings made by this careseeker
      await prisma.booking.deleteMany({ where: { careSeekerId: csId } })
      // Step 3: delete the careseeker profile
      await prisma.careSeeker.delete({ where: { id: csId } })
    }

    // Finally delete the user
    await prisma.user.delete({ where: { id } })

    res.json({ message: `User "${user.name}" deleted successfully` })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: err.message })
  }
}