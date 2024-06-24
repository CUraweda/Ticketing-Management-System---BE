var express = require("express");
const { error, success } = require("../../utils/response");
const { decrypt } = require("../../utils/encryption");
var router = express.Router();
const barcodeModel = require('../models/barcode.model')

router.post('/use', async (req, res) => {
    const { data } = req.body
    try{
        const decryptedData = JSON.parse(decrypt(data))
        const { uniqueId } = decryptedData
        if(!uniqueId) throw Error('Invalid QR Data, cannot be proccessed')
        const barcode = await barcodeModel.isExist(uniqueId)
        if(barcode.transaction.status === "MENUNGGU_PEMBAYARAN") throw Error('Pembayaran Transaksi masih belum selesai')
        const updatedQR = await barcodeModel.use(barcode.id)
        return success(res, 'QR Successfully used', updatedQR)
    }catch(err){
        return error(res, err.message)
    }
})


module.exports = router