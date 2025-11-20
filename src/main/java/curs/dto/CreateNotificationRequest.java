package curs.dto;

import curs.model.User;
import lombok.Data;

@Data
public class CreateNotificationRequest {
    private Long userId;
    private String message;
}

