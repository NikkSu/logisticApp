package curs.dto;

import lombok.Data;

@Data
public class DeliveryInfoDTO {
    private Long id;
    private String originAddress;
    private String destinationAddress;
    private Double distanceKm;
    private Double estimatedTimeHours;
    private Long supplierId;
}
