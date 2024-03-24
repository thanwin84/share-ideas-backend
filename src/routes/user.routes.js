import {
    updateUserDetaiils,
    changePassword,
    changeAvatar,
    getCurrentUser,
    getUserDetailsById,
    addPhoneNumber,
    toggleTwoStepAuthentication,
    deleteAccount
} from '../controllers/user.controller.js'
import {Router} from 'express'
import { verityJWT } from '../middlewares/verityJWT.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()
router.use(verityJWT)

router.route('/current-user').get(getCurrentUser)

router.route('/:userId').get(getUserDetailsById)

router.route('/update-details').patch(updateUserDetaiils)
router.route('/change-password')
.patch(changePassword)
router.route('/change-avatar')
.patch(upload.single('avatar'),changeAvatar)

router.route('/update-phone-number').patch(addPhoneNumber)
router.route('/toggle-two-step-authentication').patch(toggleTwoStepAuthentication)

router.route("/").delete(deleteAccount)


export default router;