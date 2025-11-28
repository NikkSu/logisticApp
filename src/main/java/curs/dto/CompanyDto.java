package curs.dto;

import lombok.Data;

@Data
public class CompanyDto {
    private Long id;
    private String name;
    private String address;
    private String logoPath;
    private String description;
    private Long ownerId;
    private String ownerName;

    private String phone;
    private String inn;
    private String contactEmail;
    private String website;

    private Double longitude;
    private Double latitude;
}

