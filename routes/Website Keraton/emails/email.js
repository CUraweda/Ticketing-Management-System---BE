const nodemailer = require('nodemailer')
const Email = require('email-templates')
const path = require('path');
const { readFileSync } = require('fs');

class Emails {
    constructor(from, to, subject = '', text = '') {
        this.email = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        this.emailTemplate = new Email({
            message: { from },
            send: true,
            transport: this.email,
            views: {
                root: path.resolve('routes/Website Keraton/emails/templates'),
                options: {
                    extension: 'ejs'
                }
            }
        })
        this.mailOptions = {
            from, to, subject, text
        }
    }

    setFrom(val) {
        this.mailOptions['from'] = val
        return this
    }
    setTo(val) {
        this.mailOptions['to'] = val
        return this
    }
    setSubject(val) {
        this.mailOptions['subject'] = val
        return this
    }
    setText(val) {
        this.mailOptions['text'] = val
        return this
    }
    async sendEmail() {
        try {
            await this.email.sendMail(this.mailOptions)
        } catch (err) {
            console.log(err)
        }
    }
    async renderEmail(variables) {
        const html = await this.emailTemplate.render('invoice', variables);
        return html;
    }
    async sendEmailTemplate(variables, imageAttachment = []) {
        let attachments = []
        try {
            for (let imageIndex in imageAttachment) {
                const indexData = imageAttachment[imageIndex]
                const imageData = await readFileSync(indexData)
                attachments.push({
                    content: imageData,
                    encoding: 'base64',
                    cid: imageIndex, // Referenced in the HTML template
                })
            }
            const html = await this.renderEmail(variables)
            await this.email.sendMail({
                ...this.mailOptions,
                html: html,
                attachments
            })
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Emails