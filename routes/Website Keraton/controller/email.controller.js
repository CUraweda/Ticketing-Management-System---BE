var express = require("express");
var router = express.Router();
const path = require('path')
const Email = require('../emails/email');
const { error } = require("../../utils/response");
const emailClass = new Email()

router.get('/render', async (req, res) => {
    try{
        res.render(path.resolve('routes/Website Keraton/emails/templates/invoice'), {
            email: "Email Here",
            name: "Name Here"
        })
    }catch(err){
        return error(res, err.message)
    }
})

module.exports = router