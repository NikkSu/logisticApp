package curs.mapper;

import curs.dto.ProductFullDto;
import curs.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductFullMapper {

    public ProductFullDto toDto(Product p) {
        ProductFullDto dto = new ProductFullDto();

        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        dto.setImagePath(p.getImagePath());
        dto.setDescription(p.getDescription());

        if (p.getSupplierCompany() != null) {
            dto.setSupplierId(p.getSupplierCompany().getId());
            dto.setSupplierCompanyName(p.getSupplierCompany().getName());
            dto.setSupplierAddress(p.getSupplierCompany().getAddress());
            dto.setSupplierLat(p.getSupplierCompany().getLatitude());
            dto.setSupplierLng(p.getSupplierCompany().getLongitude());
        }

        return dto;
    }
}
