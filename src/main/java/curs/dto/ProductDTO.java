package curs.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String category;
    private Double price;
    private Long supplierId;
}
