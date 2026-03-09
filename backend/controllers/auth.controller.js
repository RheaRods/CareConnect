import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, password, role, profile } = req.body

    if (!['CARETAKER', 'CARESEEKER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Role must be CARETAKER or CARESEEKER' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        ...(role === 'CARETAKER' && {
          caretaker: {
            create: {
              bio: profile?.bio ?? null,
              hourlyRate: profile?.hourlyRate ?? 0,
              availability: profile?.availability ?? 'flexible',
            },
          },
        }),
        ...(role === 'CARESEEKER' && {
          careSeeker: {
            create: {
              address: profile?.address ?? null,
              notes: profile?.notes ?? null,
            },
          },
        }),
      },
      include: { caretaker: true, careSeeker: true },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...safeUser } = user
    res.status(201).json({ user: safeUser, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      include: { caretaker: true, careSeeker: true },
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid password' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/auth/me
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { caretaker: true, careSeeker: true },
    })
    const { password: _, ...safeUser } = user
    res.json(safeUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
