import {
    updateUserDetaiils,
    changePassword,
    changeAvatar,
    getCurrentUser,
    getUserDetailsById
} from '../controllers/user.controller.js'
import {Router} from 'express'
import { verityJWT } from '../middlewares/verityJWT.middleware.js'

const router = Router()
router.use(verityJWT)

router.route('/current-user').get(getCurrentUser)

router.route('/:userId').get(getUserDetailsById)

router.route('/updateDetails').patch(updateUserDetaiils)
router.route('/changePassword').patch(changePassword)
router.route('/changeAvatar').patch(changeAvatar)



export default router;