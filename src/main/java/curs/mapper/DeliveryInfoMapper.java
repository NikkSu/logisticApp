package curs.mapper;

import curs.model.DeliveryInfo;
import curs.dto.DeliveryInfoDTO;

public class DeliveryInfoMapper {
    public static DeliveryInfoDTO toDTO(DeliveryInfo d) {
        DeliveryInfoDTO dto = new DeliveryInfoDTO();
        dto.setId(d.getId());
        dto.setOriginAddress(d.getOriginAddress());
        dto.setDestinationAddress(d.getDestinationAddress());
        dto.setDistanceKm(d.getDistanceKm());
        dto.setEstimatedTimeHours(d.getEstimatedTimeHours());
        if (d.getSupplier() != null) dto.setSupplierId(d.getSupplier().getId());
        return dto;
    }
}
