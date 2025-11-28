package curs.mapper;

import curs.dto.OrderDetailDTO;
import curs.model.Order;
import curs.dto.OrderDTO;
import curs.dto.OrderItemDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Component
public class OrderMapper {
    public OrderDTO toDto(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setDate(order.getDate());
        dto.setStatus(String.valueOf(order.getStatus()));
        dto.setSupplierId(order.getSupplier().getId());
        dto.setSupplierName(order.getSupplier().getUser().getCompany().getName());
        dto.setTotalSum(order.getTotalSum());

        dto.setItems(
                order.getItems().stream()
                        .map(oi -> {
                            OrderDTO.ItemDTO item = new OrderDTO.ItemDTO();
                            item.setProductId(oi.getProduct().getId());
                            item.setProductName(oi.getProduct().getName());
                            item.setQuantity(oi.getQuantity());
                            item.setPrice(oi.getPrice());
                            return item;
                        })
                        .toList()
        );

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



