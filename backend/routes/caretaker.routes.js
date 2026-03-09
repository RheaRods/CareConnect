import { Router } from 'express'
import { listCaretakers, getCaretaker, updateCaretakerProfile } from '../controllers/caretaker.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listCaretakers)
router.get('/:id', getCaretaker)
router.put('/profile', authenticate, requireRole('CARETAKER'), updateCaretakerProfile)

export default router
