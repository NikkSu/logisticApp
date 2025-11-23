package curs.mapper;

import curs.dto.OrderDetailDTO;
import curs.model.Order;
import curs.dto.OrderDTO;
import curs.dto.OrderItemDTO;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {
    public OrderDTO toDto(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setSupplierName(order.getSupplier().getCompanyName());
        dto.setDate(order.getDate().toString());
        dto.setTotalSum(order.getTotalSum());
        dto.setStatus(order.getStatus().name());
        return dto;
    }

    public OrderDetailDTO toDetailDto(Order order) {
        OrderDetailDTO dto = new OrderDetailDTO();
        dto.setId(order.getId());
        dto.setSupplierName(order.getSupplier().getCompanyName());
        dto.setDate(order.getDate());
        dto.setTotalSum(order.getTotalSum());
        dto.setStatus(order.getStatus().name());

        dto.setItems(
                order.getItems().stream()
                        .map(i -> new OrderItemDTO(
                                i.getProduct().getName(),
                                i.getQuantity(),
                                i.getProduct().getPrice()
                        ))
                        .collect(Collectors.toList())
        );

        return dto;
    }

}



