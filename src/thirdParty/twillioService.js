import Client from 'twilio'
// import dotenv from 'dotenv'
// dotenv.config({path: "../../.env"})

const acount_sid = process.env.TWILLIO_ACCOUNT_SID
const auth_token = process.env.TWILLIO_AUTH_TOKEN

const client = Client(acount_sid, auth_token)


class TwillioService{
    constructor(){
        this.serviceId = process.env.TWILLIO_SERVICE_ID
    }

    async  sendVerificationToken(phoneNumber, channel){
       
        try {
            const verification = await client.verify.v2.services(this.serviceId)
                        .verifications
                        .create({to: phoneNumber, channel})
            return verification.status

        } catch (error) {
            console.log(error)
            throw error
        }

    }
    
    async  verificationCheck(phoneNumber, code){
        try {
            const verificationCheck = await client.verify.v2.services(this.serviceId)
              .verificationChecks
              .create({to: phoneNumber, code})
            return verificationCheck.status
        } catch (error) {
            throw error
        }
    }
}
const twillioService = new TwillioService()
export default twillioService