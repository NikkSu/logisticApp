package curs.dto;

import lombok.Data;

@Data
public class SupplierRequestDto {
    private Long id;
    private Long userId;
    private String username;

    private String companyName;
    private String inn;
    private String address;
    private String description;
    private String website;
    private String phone;

    private String rejectionReason;
    private boolean approved;
    private boolean rejected;
}
