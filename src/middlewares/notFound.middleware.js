function notFoundMiddleware(req, res){
    res.status(404).json("Route doesnot exists")
}

export default notFoundMiddleware