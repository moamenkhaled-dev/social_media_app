import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer/index.js";
import {
  APPLICATION_NAME,
  EMAIL_PASS,
  EMAIL_USER,
} from "../../../config/config.js";

const transporter = createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

export const sendMail = async (data: Mail.Options) => {
  await transporter.sendMail({
    from: `${APPLICATION_NAME} ${EMAIL_USER}`,
    ...data,
  });
};
