const CryptoJS = require("crypto-js")
const base64url = require("base64url")
const https = require("https")
const axios = require("axios")
const cas = require("ssl-root-cas")

const paymentValidator = require("./payment.validator.js")

const rootCas = cas.create()
rootCas.addFile('routes/utils/secrets/public-payment.pem')

class PaymentHelper {
    /**
     * 
     * @param {string} redirectPath 
     */
    constructor() {
        this.#pUrl = process.env.PAYMENT_URL
        this.#bUrl = process.env.BASE_URL
        this.#passphrase = "ibdsai65s"
        this.#httpsAgent = new https.Agent({
            // rejectUnauthorized: false
            // ca: fs.readFileSync("secrets/public-payment.pem")
            ca: rootCas
        })
        this.#keratonCode = {
            code: "03",
            name: "KERATON"
        }
    }

    pCurawedaUrl = {
        qris: {
            create: {
                name: "qris-create",
                path: "paylabs/qris/create",
                val: paymentValidator.createQris
            },
            inquiry: {
                name: "qris-inquiry",
                path: "paylabs/qris/query",
                val: paymentValidator.inquiryQris
            },
            // cancel: "paylabs/qris/cancel"
        },
        va: {
            create: {
                name: "va-create",
                path: "paylabs/payment/va/create",
                val: paymentValidator.createVa
            },
            // inquiry: {
            //     name: "va-inquiry",
            //     path: "paylabs/transfer-va/status",
            //     val: paymentValidator.inquiryVa
            // },
            // update: "paylabs/transfer-va/update-va"
        }
    }

    #pUrl; #bUrl; #keratonCode; #passphrase; #httpsAgent

    _encryptTID(tid) {
        return base64url.encode(CryptoJS.AES.encrypt(tid, this.#passphrase).toString())
    }

    _decryptTID(text) {
        const bytes = CryptoJS.AES.decrypt(base64url.decode(text), this.#passphrase);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    }

    _checkMethod(method, usage) {
        if (method === "QRIS") {
            return this.pCurawedaUrl.qris[usage] || false
        } else if (method.includes("VA")) {
            return this.pCurawedaUrl.va[usage] || false
        } else return false
    }

    _parseDate(paymentData) {
        if (paymentData?.virtualAccountData) {
            return new Date(paymentData.virtualAccountData.expiredDate);
        } else if (paymentData?.expiredTime) {
            const str = paymentData.expiredTime;
            const formatted = `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}`;
            return new Date(formatted);
        }
        return null;
    }

    async _formatBody(method, body) {
        const { val, name } = method
        switch (name) {
            case "qris-create":
                body['username'] = body.data.user.name
                body['email'] = body.data.user.email
                body['amount'] = body.data.total.toString()
                body['productInfo'] = { id: this.#keratonCode.code, name: this.#keratonCode.name }
                body['productName'] = `${this.#keratonCode.name}|${this.#keratonCode.name}|01`
                break
            case "va-create":
                body['username'] = body.data.user.name
                body['email'] = body.data.user.email
                body['amount'] = body.data.total.toString()
                body['productInfo'] = { id: this.#keratonCode.code, name: this.#keratonCode.name }
                body['productName'] = `${this.#keratonCode.name}|${this.#keratonCode.name}|01`
                break
        }
        const options = { abortEarly: false, allowUnknown: true, stripUnknown: true, };
        try {
            return await val.parseAsync(body, options)
        } catch (e) {
            console.log(e)
            throw new Error("Body cannot be processed")
        }
    }

    //?============================= MAIN FUNCTION =======================
    async create(body) {
        const method = this._checkMethod(body.paymentType, "create")
        if (!method) throw new Error("Invalid Payment Method")

        console.log(body)
        body['appUrl'] = `${this.#bUrl}/payment/notify/${this._encryptTID(body.transactionId)}`
        body = await this._formatBody(method, body)

        console.log(body)
        return await axios.post(`${this.#pUrl}/${method.path}`, body, { httpsAgent: this.#httpsAgent }).then((res) => {
            res.data['expiredDate'] = this._parseDate(res.data)
            return res.data
        }).catch((e) => {
            console.log(e)
            throw new Error("Error on payment server")
        })
    }

    async check(body) {
        const url = this._checkMethod(body.paymentType, "inquiry")
        if (!url) throw new Error("Invalid Payment Method")

        await fetch(`${this.#pUrl}/${url}`, { method: "POST", body }).then((res) => {
            if (!res.ok) throw new Error()
            return res.body
        }).catch((e) => { console.log(e) })
    }

    async cancel(body) {
        const url = this._checkMethod(body.paymentType, "cancel")
        if (!url) throw new Error("Invalid Payment Method")

        await fetch(`${this.#pUrl}/${url}`, { method: "POST", body }).then((res) => {
            if (!res.ok) throw new Error()
            return res.body
        }).catch((e) => { console.log(e) })
    }

    async updateVa(body) {
        const url = this._checkMethod(body.paymentType, "update")
        if (!url) throw new Error("Invalid Payment Method")

        await fetch(`${this.#pUrl}/${url}`, { method: "PUT", body }).then((res) => {
            if (!res.ok) throw new Error()
            return res.body
        }).catch((e) => { console.log(e) })
    }
}

module.exports = PaymentHelper