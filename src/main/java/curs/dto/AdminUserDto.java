package curs.dto;
import lombok.Data;
@Data
public class AdminUserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String avatarPath;
    private Long companyId;
}
