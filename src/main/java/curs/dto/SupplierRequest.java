package curs.dto;

import lombok.Data;

@Data
public class SupplierRequest {
    private String companyName;
    private String inn;
    private String address;
    private String description;
    private String website;
    private String phone;
}
