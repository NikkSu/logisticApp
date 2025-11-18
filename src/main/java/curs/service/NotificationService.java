package curs.service;

import curs.dto.NotificationDto;
import curs.mapper.NotificationMapper;
import curs.model.Notification;
import curs.model.User;
import curs.repo.NotificationRepository;
import curs.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional
    public void createNotification(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification n = Notification.builder()
                .user(user)
                .message(message)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(n);
    }

    @Transactional
    public void deleteNotification(Long id, Long userId) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notif.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: cannot delete other users' notifications");
        }

        notificationRepository.delete(notif);
    }
    public List<Notification> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }
    @Transactional
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(notificationMapper::toDto)
                .toList();
    }
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }
}
