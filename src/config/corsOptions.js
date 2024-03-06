import cors from 'cors'
import whiteList from './whitelist.js'

const corsOptions = {
    origin: function(origin, callback){
        if (whiteList.indexOf(origin) != -1 || !origin){
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    }
}

export {
    corsOptions
}