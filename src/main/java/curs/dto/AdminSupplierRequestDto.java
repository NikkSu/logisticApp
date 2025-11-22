package curs.dto;

import lombok.Data;

@Data
public class AdminSupplierRequestDto {
    private Long id;
    private Long userId;
    private String userName;
    private String companyName;
    private String inn;
    private String phone;
    private String address;
}
