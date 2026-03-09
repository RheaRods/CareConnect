
import 'dotenv/config'
import express from 'express'
import adminRoutes from './routes/admin.routes.js'
import authRoutes from './routes/auth.routes.js'
import caretakerRoutes from './routes/caretaker.routes.js'
import careSeekerRoutes from './routes/careseeker.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import reviewRoutes from './routes/review.routes.js'


// With the other app.use() lines:

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/caretakers', caretakerRoutes)
app.use('/api/careseekers', careSeekerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`✅ Caregiver API running at http://localhost:${PORT}`)
  console.log(``)
  console.log(`📋 Available Routes:`)
  console.log(`   GET    /api/admin/caretakers/pending`)
  console.log(`   GET    /api/admin/caretakers`)
  console.log(`   PATCH  /api/admin/caretakers/:id/verify`)
  console.log(`   GET    /api/admin/users`)
  console.log(`   POST   /api/auth/register`)
  console.log(`   POST   /api/auth/login`)
  console.log(`   GET    /api/auth/me`)
  console.log(`   GET    /api/caretakers`)
  console.log(`   GET    /api/caretakers/:id`)
  console.log(`   PUT    /api/caretakers/profile`)
  console.log(`   GET    /api/careseekers/profile`)
  console.log(`   PUT    /api/careseekers/profile`)
  console.log(`   POST   /api/bookings`)
  console.log(`   GET    /api/bookings`)
  console.log(`   GET    /api/bookings/:id`)
  console.log(`   PATCH  /api/bookings/:id/status`)
  console.log(`   POST   /api/reviews`)
  console.log(`   GET    /api/reviews/caretaker/:id`)
})
