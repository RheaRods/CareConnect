import prisma from '../lib/prisma.js'

// GET /api/admin/caretakers/pending
export async function getPendingCaretakers(req, res) {
  try {
    const list = await prisma.caretaker.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/caretakers  (all caretakers with status)
export async function getAllCaretakers(req, res) {
  try {
    const list = await prisma.caretaker.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
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
    const { status, rejectionReason } = req.body
    const id = parseInt(req.params.id)

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' })
    }

    const caretaker = await prisma.caretaker.findUnique({ where: { id } })
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' })

    const updated = await prisma.caretaker.update({
      where: { id },
      data: {
        verificationStatus: status,
        verifiedAt:new Date()
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    res.json({ message: `Caretaker ${status.toLowerCase()} successfully`, caretaker: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/users  (all users in the system)
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
