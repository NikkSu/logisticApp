package curs.repo;

import curs.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndReadFalse(Long userId);

    List<Notification> findByUserId(Long userId);
}
