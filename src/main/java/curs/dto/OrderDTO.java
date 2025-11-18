package curs.dto;

import lombok.Data;


@Data
public class OrderDTO {
    private Long id;
    private String supplierName;
    private String date;
    private double totalSum;
    private String status;
}

