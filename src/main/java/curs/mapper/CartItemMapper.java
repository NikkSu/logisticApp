package curs.mapper;

import curs.dto.CartItemDto;
import curs.model.CartItem;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CartItemMapper {

    public CartItemDto toDto(CartItem ci) {
        var p = ci.getProduct();

        return new CartItemDto(
                p.getId(),
                p.getName(),
                ci.getQuantity(),
                p.getPrice(),
                p.getImagePath(),
                p.getSupplier().getUser().getCompany().getId(),
                p.getSupplier().getUser().getCompany().getName()
        );
    }
}


