package com.staybnb.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import org.springframework.core.io.ClassPathResource;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendBookingConfirmation(String toEmail, String guestName, String listingTitle, String checkIn,
            String checkOut, BigDecimal totalPrice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_RELATED, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("හෙළStay - Booking Confirmed!");

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("en", "LK"));
            String formattedPrice = currencyFormat.format(totalPrice).replace("LKR", "LKR ");

            String htmlContent = "<div style=\"font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f9fafb;border-radius:12px;color:#1f2937;\">"
                    + "<div style=\"text-align:center;margin-bottom:24px;\">"
                    + "  <img src=\"cid:logo\" alt=\"Hela Stay\" style=\"height: 80px; width: auto; display: block; margin: 0 auto;\">"
                    + "</div>"
                    + "<div style=\"background:#ffffff;padding:32px;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);\">"
                    + "  <h2 style=\"margin-top:0;color:#111827;font-size:24px;\">Booking Confirmed!</h2>"
                    + "  <p style=\"font-size:16px;line-height:1.6;color:#4b5563;\">Hi " + guestName + ",</p>"
                    + "  <p style=\"font-size:16px;line-height:1.6;color:#4b5563;\">Your stay at <strong>"
                    + listingTitle + "</strong> has been successfully booked.</p>"
                    + "  <div style=\"background:#f3f4f6;padding:20px;border-radius:8px;margin:24px 0;\">"
                    + "    <table style=\"width:100%;border-collapse:collapse;\">"
                    + "      <tr><td style=\"padding:8px 0;color:#6b7280;font-size:14px;\">Check-in</td><td style=\"padding:8px 0;text-align:right;font-weight:600;\">"
                    + checkIn + "</td></tr>"
                    + "      <tr><td style=\"padding:8px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;\">Check-out</td><td style=\"padding:8px 0;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;\">"
                    + checkOut + "</td></tr>"
                    + "      <tr><td style=\"padding:12px 0 4px;color:#374151;font-weight:700;font-size:16px;\">Total Price</td><td style=\"padding:12px 0 4px;text-align:right;font-weight:700;font-size:18px;color:#ff5a5f;\">"
                    + formattedPrice + "</td></tr>"
                    + "    </table>"
                    + "  </div>"
                    + "  <p style=\"font-size:16px;line-height:1.6;color:#4b5563;margin-bottom:0;\">Thank you for choosing Hela Stay for your adventure!</p>"
                    + "</div>"
                    + "<div style=\"text-align:center;margin-top:32px;\">"
                    + "  <p style=\"font-size:14px;color:#6b7280;margin-bottom:12px;\">Ready for your next adventure?</p>"
                    + "  <a href=\"http://localhost:8080\" style=\"display:inline-block;padding:10px 24px;background-color:#ff5a5f;color:#ffffff;text-decoration:none;border-radius:24px;font-weight:600;font-size:14px;box-shadow:0 2px 4px rgba(255,90,95,0.3);\">Explore helastay.com &rarr;</a>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            helper.addInline("logo", new ClassPathResource("static/logo.png"), "image/png");
            
            mailSender.send(message);
            log.info("HTML Booking confirmation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_RELATED, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("හෙළStay - Password Reset Code");

            String htmlContent = "<div style=\"font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f9fafb;border-radius:12px;color:#1f2937;\">"
                    + "<div style=\"text-align:center;margin-bottom:24px;\">"
                    + "  <img src=\"cid:logo\" alt=\"Hela Stay\" style=\"height: 80px; width: auto; display: block; margin: 0 auto;\">"
                    + "</div>"
                    + "<div style=\"background:#ffffff;padding:32px;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);text-align:center;\">"
                    + "  <h2 style=\"margin-top:0;color:#111827;font-size:24px;\">Password Reset</h2>"
                    + "  <p style=\"font-size:16px;line-height:1.6;color:#4b5563;margin-bottom:24px;\">We received a request to reset your password. Use the verification code below to securely regain access to your account.</p>"
                    + "  <div style=\"background:#f3f4f6;border:2px dashed #cbd5e1;padding:20px;border-radius:12px;display:inline-block;margin-bottom:24px;\">"
                    + "    <span style=\"font-size:36px;font-weight:800;letter-spacing:8px;color:#0f172a;\">"
                    + resetCode + "</span>"
                    + "  </div>"
                    + "  <p style=\"font-size:14px;color:#6b7280;margin:0;\">This code will expire in <strong>15 minutes</strong>.</p>"
                    + "  <p style=\"font-size:12px;color:#9ca3af;margin-top:24px;\">If you did not request a password reset, you can safely ignore this email.</p>"
                    + "</div>"
                    + "<div style=\"text-align:center;margin-top:24px;\">"
                    + "  <a href=\"http://localhost:8080\" style=\"color:#ff5a5f;text-decoration:none;font-weight:600;font-size:14px;display:inline-flex;align-items:center;\">"
                    + "    <span style=\"margin-right:6px;\">&larr;</span> Return to helastay.com"
                    + "  </a>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            helper.addInline("logo", new ClassPathResource("static/logo.png"), "image/png");
            
            mailSender.send(message);
            log.info("HTML Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}