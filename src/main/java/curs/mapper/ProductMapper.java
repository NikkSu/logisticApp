package curs.mapper;

import curs.dto.ProductDto;
import curs.model.Product;

public class ProductMapper {

    public static ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        dto.setImagePath(p.getImagePath());
        dto.setDescription(p.getDescription());

        if (p.getSupplierCompany() != null) {
            dto.setSupplierId(p.getSupplierCompany().getId());
            dto.setSupplierCompanyName(p.getSupplierCompany().getName());
            dto.setSupplierLat(p.getSupplierCompany().getLatitude());
            dto.setSupplierLng(p.getSupplierCompany().getLongitude());
        }

        return dto;
    }

}
