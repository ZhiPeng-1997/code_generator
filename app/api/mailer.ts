import nodemailer, { SendMailOptions } from "nodemailer";


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST, // QQ 邮箱 SMTP 服务器地址
    port: parseInt(process.env.MAIL_SMTP_PORT as string),          // 使用 SSL/TLS 的端口
    secure: true,       // 使用 SSL/TLS 加密
    auth: {
        user: process.env.MAIL_SMTP_USER, // 替换为你的 QQ 邮箱地址
        pass: process.env.MAIL_SMTP_PASS // 替换为你的 QQ 邮箱授权码
    }
});


export async function sendMail(to: string, title: string, content: string): Promise<object> {
    const mailOptions: SendMailOptions = {
        from: `"ME" <${process.env.MAIL_SMTP_USER}>`, // 发件人名称和邮箱
        to: to,                 // 收件人邮箱
        subject: title,             // 邮件主题
        text: content, // 纯文本内容
    };

    return transporter.sendMail(mailOptions);
}