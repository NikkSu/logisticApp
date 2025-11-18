package curs.controller;

import curs.dto.NotificationDto;
import curs.model.Notification;
import curs.service.NotificationService;
import curs.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new RuntimeException("Missing token");
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token))
            throw new RuntimeException("Invalid token");
        return jwtUtil.extractUserId(token);
    }

    @GetMapping
    public List<NotificationDto> getUserNotifications(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        return notificationService.getUserNotifications(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = getUserIdFromHeader(authHeader);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }
}

