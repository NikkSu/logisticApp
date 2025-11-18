package curs.dto;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String avatarPath;
}

