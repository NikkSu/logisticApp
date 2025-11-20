package curs.dto;
import curs.model.User;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class NotificationDto {
    private Long id;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    private Long userId;
    private String username;
}

