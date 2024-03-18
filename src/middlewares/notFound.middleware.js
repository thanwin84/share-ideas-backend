function notFoundMiddleware(req, res, next){
    res.status(404).json("Route doesnot exists")
    next()
}

export default notFoundMiddleware