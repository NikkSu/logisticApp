package curs.dto;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class UserLoginDTO {
    private String email;
    private String password;

}

