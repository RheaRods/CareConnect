import { Router } from 'express'
import {
  getPendingCaretakers,
  getAllCaretakers,
  verifyCaretaker,
  getAllUsers
} from '../controllers/admin.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

// All admin routes require login + ADMIN role
router.use(authenticate, requireRole('ADMIN'))

router.get('/caretakers/pending', getPendingCaretakers)  // see who needs verification
router.get('/caretakers', getAllCaretakers)               // see all caretakers + status
router.patch('/caretakers/:id/verify', verifyCaretaker)  // approve or reject
router.get('/users', getAllUsers)                         // see all users in system

export default router
