package curs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


    @Service
    public class EmailService {
        private final JavaMailSender mailSender;

        @Autowired
        public EmailService(JavaMailSender mailSender) {
            this.mailSender = mailSender;
        }

        public void sendNewPassword(String to, String newPassword) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Ваш новый пароль");
            message.setText("Ваш новый пароль: " + newPassword + "\nПожалуйста, смените его после входа.");
            mailSender.send(message);
        }
    }

