package curs.dto;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class UserRegisterDTO {
    private String username;
    private String email;
    private String password;

}
