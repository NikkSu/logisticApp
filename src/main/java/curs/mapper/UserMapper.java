package curs.mapper;


import curs.dto.UserDTO;
import curs.dto.UserRegisterDTO;
import curs.dto.UserResponseDTO;
import curs.model.User;
import curs.model.enums.Role;
import org.springframework.stereotype.Component;
@Component
public class UserMapper {

    public static User toEntity(UserRegisterDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(Role.USER);
        return user;
    }

    public static UserResponseDTO toResponseDTO(User entity) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setAvatarPath(entity.getAvatarPath());
        return dto;
    }
    public  static UserDTO toDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAvatarPath(user.getAvatarPath());
        return dto;
    }
}

