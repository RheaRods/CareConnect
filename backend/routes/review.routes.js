import { Router } from 'express'
import { createReview, getCaretakerReviews } from '../controllers/review.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, requireRole('CARESEEKER'), createReview)
router.get('/caretaker/:id', getCaretakerReviews)

export default router
