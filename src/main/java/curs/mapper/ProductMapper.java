// src/main/java/curs/mapper/ProductMapper.java
package curs.mapper;

import curs.dto.ProductCreateDto;
import curs.dto.ProductDto;
import curs.model.Product;
import curs.model.Supplier;

public class ProductMapper {

    public static ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        dto.setDescription(p.getDescription());
        dto.setImagePath(p.getImagePath());
        dto.setSupplierId(p.getSupplier().getId());
        dto.setSupplierCompanyName(p.getSupplier().getCompanyName());
        return dto;
    }
}
