// src/main/java/curs/dto/ProductDto.java
package curs.dto;

import lombok.Data;

@Data
public class ProductDto {
    private Long id;
    private String name;
    private String category;
    private Double price;
    private String imagePath;
    private String description;
    private Long supplierId;
    private String supplierCompanyName;
    private String supplierAddress;
    private Double supplierLat;
    private Double supplierLng;
}

