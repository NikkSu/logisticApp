package curs.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;


@Data
public class OrderDTO {
    private Long id;
    private LocalDate date;
    private String status;
    private Double totalSum;

    private Long supplierId;
    private String supplierName;

    private List<ItemDTO> items;
    @Data
    public static class ItemDTO {
        private Long productId;
        private String productName;
        private int quantity;
        private double price;
    }
}


