require('dotenv').config();

export default class QrGenerator {
    #defaultPath
    constructor(){
        this.#defaultPath = process.env.QR_PATH
    }

    create(name, storedData){

    }
}