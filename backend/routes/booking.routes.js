import { Router } from 'express'
import { createBooking, getMyBookings, getBooking, updateBookingStatus } from '../controllers/booking.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, requireRole('CARESEEKER'), createBooking)
router.get('/', authenticate, getMyBookings)
router.get('/:id', authenticate, getBooking)
router.patch('/:id/status', authenticate, updateBookingStatus)

export default router
