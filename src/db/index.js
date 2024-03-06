import mongoose from "mongoose";
import { dbName } from "../constants/index.js";

const connectToDB = async()=>{
    try {
        const connectionString = `${process.env.MONGO_URI}/${dbName}`
        const connectionInstance = await mongoose.connect(connectionString)
        console.log('mongodb has connected successfully', 
        {
            host: connectionInstance.connection.host,
            port: connectionInstance.connection.port,
            dbName: connectionInstance.connection.name
        }
        )
    }catch(error){
        console.log('mongodb connection failed', error)
        process.exit(1)
    }
}

export default connectToDB