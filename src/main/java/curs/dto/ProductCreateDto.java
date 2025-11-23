// src/main/java/curs/dto/ProductCreateDto.java
package curs.dto;

import lombok.Data;

@Data
public class ProductCreateDto {
    private String name;
    private String category;
    private Double price;
    private String description;
}
