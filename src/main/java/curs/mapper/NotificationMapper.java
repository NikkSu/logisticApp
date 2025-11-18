package curs.mapper;

import curs.dto.NotificationDto;
import curs.model.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDto toDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }

    public static Notification toEntity(NotificationDto dto) {
        Notification n = new Notification();
        n.setId(dto.getId());
        n.setMessage(dto.getMessage());
        n.setRead(dto.isRead());
        n.setCreatedAt(dto.getCreatedAt());
        return n;
    }
}
