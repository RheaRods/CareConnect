import { Router } from 'express'
import { getMyProfile, updateMyProfile } from '../controllers/careseeker.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/profile', authenticate, requireRole('CARESEEKER'), getMyProfile)
router.put('/profile', authenticate, requireRole('CARESEEKER'), updateMyProfile)

export default router
