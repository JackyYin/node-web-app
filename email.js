const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports 
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
 if (error) {
      console.log(error);
 } else {
      console.log('Server is ready to take our messages');
 }
});

var from = '"Jacky Yin" <yinyinhaohao@gmail.com>';
var errorRecipient = 'jjyyg1123@gmail.com';

module.exports = {
    send: (to, subj, body, callback) => {
      transporter.sendMail({
        from: from,
        to: to,
        subject: subj,
        html: body
      }, callback);
    },
    emailError: (message, filename, exception) => {
      var body = '<h1>Meadowlark Travel Site Error</h1>' + 'message:<br><pre>' + message + '</pre><br>';
      if (exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
      if (filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
      transporter.sendMail({
        from: from,
        to: errorRecipient,
        subject: 'Meadowlark Travel Site Error',
        html: body,
        generateTextFromHtml: true
      }, (err) => {
        if(err) {
          console.log('Unable to send email: ' + err);
        }
      });
    }
};
