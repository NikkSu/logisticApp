package curs.dto;

import curs.model.enums.SupplierStatus;
import lombok.Data;

@Data
public class SupplierResponse {

    private Long id;
    private Long userId;

    private String companyName;
    private String inn;
    private String address;
    private String description;
    private String website;
    private String phone;

    private SupplierStatus status;
    private String rejectionReason;
}
