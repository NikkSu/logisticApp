package curs.dto;

import curs.model.Product;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private String imagePath;
    private Long supplierId;
    private String supplierCompanyName;
}

