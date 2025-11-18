package curs.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class OrderDetailDTO {
    private Long id;
    private String supplierName;
    private LocalDate date;
    private double totalSum;
    private String status;
    private List<OrderItemDTO> items;
}

