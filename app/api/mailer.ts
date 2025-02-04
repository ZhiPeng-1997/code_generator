import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST, // QQ 邮箱 SMTP 服务器地址
    port: process.env.MAIL_SMTP_PORT,          // 使用 SSL/TLS 的端口
    secure: true,       // 使用 SSL/TLS 加密
    auth: {
        user: process.env.MAIL_SMTP_USER, // 替换为你的 QQ 邮箱地址
        pass: process.env.MAIL_SMTP_PASS // 替换为你的 QQ 邮箱授权码
    }
});

module.exports = {
    sendMail: function (to: string, title: string, content: string): void {
        const mailOptions = {
            from: `"ME" <${process.env.MAIL_SMTP_USER}>`, // 发件人名称和邮箱
            to: to,                 // 收件人邮箱
            subject: title,             // 邮件主题
            text: content, // 纯文本内容
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("邮件发送失败:", error);
            } else {
                console.log("邮件发送成功:", info.messageId);
            }
        });
    }
}