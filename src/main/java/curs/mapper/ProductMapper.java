package curs.mapper;

import curs.model.Product;
import curs.dto.ProductDTO;

public class ProductMapper {
    public static Product toEntity(ProductDTO dto) {
        Product p = new Product();
        p.setId(dto.getId());
        p.setName(dto.getName());
        p.setCategory(dto.getCategory());
        p.setPrice(dto.getPrice());
        return p;
    }

    public static ProductDTO toDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        if (p.getSupplier() != null) dto.setSupplierId(p.getSupplier().getId());
        return dto;
    }
}
