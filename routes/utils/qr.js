const { encrypt } = require('./encryption')

require('dotenv').config();
const qr = require('qrcode')
const fs = require("fs");

class QrGenerator {
    #defaultPath
    #qrStoredName
    constructor() {
        this.#defaultPath = process.env.QR_PATH
    }

    #encryptAndCreateQR(path, data) {
        const stringifyData = JSON.stringify(data)
        data = encrypt(stringifyData)
        qr.toFile(path, data, (err) => {
            if (err) console.log(err)
        })
        return this
    }

    create(storedData = { uniqueId }) {
        this.#qrStoredName = `QR-${storedData.uniqueId}`
        const qrPath = this.#defaultPath + "/" + this.#qrStoredName +'.jpg'
        if (!fs.existsSync(qrPath)) this.#encryptAndCreateQR(qrPath, storedData)
        return qrPath
    }

    update(qrPath, storedData) {
        try {
            if (!fs.existsSync) throw Error('QR Path didnt exist')
            fs.unlink(qrPath)
            this.#encryptAndCreateQR(qrPath, storedData)
            return this
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = QrGenerator