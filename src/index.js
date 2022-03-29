const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
app.use(express.json());

const validateFields = (req, res, next) => {
  console.log("next", next);
  const { to, subject, content } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return throwError(res, "Fill in the required fields to send the email.");
  } else if (!to) {
    return throwError(res, "Attribute 'to' is required.");
  } else if (!subject) {
    return throwError(res, "Attribute 'subject' is required.");
  } else if (!content) {
    return throwError(res, "Attribute 'content' is required.");
  }

  next();
};

const throwError = (res, error) => res.status(400).send({ error });

app.post("/", validateFields, async (req, res) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transport
    .sendMail({
      from: req.body.from
        ? `'${req.body.from}' <${process.env.NODEMAILER_EMAIL}>`
        : process.env.NODEMAILER_EMAIL,
      to: req.body.to,
      ...(req.body.cc && { cc: req.body.cc }),
      ...(req.body.replyTo && { replyTo: req.body.replyTo }),
      subject: req.body.subject,
      html: req.body.content,
    })
    .then((info) => res.send({ ...info, request: req.body }))
    .catch((error) =>
      res.status(500).send({ message: "Email not sent.", error })
    );
});

app.listen(process.env.PORT || 3000);
