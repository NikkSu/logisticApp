package curs.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {
    private String productName;
    private int quantity;
    private double price;

}

