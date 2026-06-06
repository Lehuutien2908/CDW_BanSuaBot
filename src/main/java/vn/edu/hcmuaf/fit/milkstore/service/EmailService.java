package vn.edu.hcmuaf.fit.milkstore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Yêu cầu đặt lại mật khẩu - Suatot");
        message.setText("Chào bạn,\n\n" +
                "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n" +
                "Vui lòng nhấn vào đường link bên dưới để tạo mật khẩu mới:\n\n" +
                resetLink + "\n\n" +
                "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n" +
                "Trân trọng,\nĐội ngũ Suatot.");

        mailSender.send(message);
    }

    public void sendVerificationEmail(String toEmail, String verificationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Xác nhận đăng ký tài khoản - Suatot");
        message.setText("Chào bạn,\n\n" +
                "Cảm ơn bạn đã đăng ký tài khoản tại Suatot. Vui lòng nhấn vào đường link bên dưới để kích hoạt tài khoản của bạn:\n\n" +
                verificationLink + "\n\n" +
                "Trân trọng,\nĐội ngũ Suatot.");

        mailSender.send(message);
    }
}