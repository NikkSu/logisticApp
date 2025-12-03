package curs.dto;

import lombok.Data;

@Data
public class ProductFullDto {
    private Long id;
    private String name;
    private String category;
    private double price;
    private String description;
    private String imagePath;

    // Данные о поставщике
    private Long supplierId;
    private String supplierCompanyName;
    private String supplierAddress;
    private Double supplierLat;
    private Double supplierLng;
}
