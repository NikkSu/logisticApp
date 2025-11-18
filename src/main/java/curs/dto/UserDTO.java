package curs.dto;

import curs.model.Company;
import curs.model.enums.Role;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String avatarPath;
    private Long companyId;
    private String companyName;
    private CompanyDto  company;
}
