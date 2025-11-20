package curs.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Long supplierId;
    private List<Item> items;

    @Data
    public static class Item {
        private String productName;
        private int quantity;
        private double price;
    }
}
