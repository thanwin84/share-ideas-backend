
function asyncHandler (controller){
    return async(req, res, next)=>{
        try {
            await controller(req, res)
        } catch (error) {
            res.status(error.code || 500).json(
                {
                    success: false,
                    message: error.message
                }
            )
        }
    }
}

export {asyncHandler}