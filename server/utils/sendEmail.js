const nodemailer = require("nodemailer");
// Nodemailer
const sendEmail = async (options) => {
    // 1- Create tansporter (service that will send email like "gmail", "mailgun", "sendGrid", "mailtrap")
    const trasporter = nodemailer.createTransport({
        service: "gmail",
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // secure:true for port 465, secure:false for port 587
        secure: true,
        auth: {
            user: process.env.APP_EMAIL_ADDRESS, // sender
            pass: process.env.APP_EMAIL_PASSWORD,
        },
        from: "E-shop App <ahmedmostafa8452@gmail.com>",
    });

    // 2- Define email options (from, to, subject, email content)
    const mailOpts = {
        from: "E-shop App <ahmedmostafa8452@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3- Send email
    await trasporter.sendMail(mailOpts);
};

module.exports = sendEmail;
