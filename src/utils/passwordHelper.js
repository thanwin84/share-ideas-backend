import {
    scrypt,
    randomBytes,
    timingSafeEqual
} from 'crypto'


class PasswordHelper{
    async hashPassword(password){
        // generat random salt and convert it to hexadecimal
        const salt = randomBytes(16).toString('hex')
        return new Promise((resolve, reject)=>{
            scrypt(password, salt, 64, (err, hashedBuffer)=>{
                if (err){
                    reject(err)
                } else {
                    const hashedPassword = hashedBuffer.toString('hex')
                    const password = `${salt}:${hashedPassword}`
                    resolve(password)
                }
            })
        })
    }
    
    async isPasswordCorrect(password, salt, hash){
        const hashedBuffer = await new Promise((resolve, reject)=>{
            scrypt(password, salt, 64, (err, hashedBuffer)=>{
                if (err){
                    reject(err)
                } else {
                    resolve(hashedBuffer)
                }
            })
        })
        // convert hash(hashed password from db) to buffer
        const keybuffer = Buffer.from(hash, 'hex')

        const match = timingSafeEqual(hashedBuffer, keybuffer)
        return match
    }
}


const passwordHelper = new PasswordHelper

export default passwordHelper