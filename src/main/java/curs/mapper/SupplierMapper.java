package curs.mapper;

import curs.dto.SupplierResponse;
import curs.model.Supplier;

public class SupplierMapper {

    public static SupplierResponse toDto(Supplier s) {
        if (s == null) return null;

        SupplierResponse dto = new SupplierResponse();
        dto.setId(s.getId());

        dto.setUserId(
                s.getUser() != null ? s.getUser().getId() : null
        );

        dto.setCompanyName(s.getCompanyName());
        dto.setInn(s.getInn());
        dto.setAddress(s.getAddress());
        dto.setDescription(s.getDescription());
        dto.setWebsite(s.getWebsite());
        dto.setPhone(s.getPhone());

        dto.setStatus(s.getStatus());
        dto.setRejectionReason(s.getRejectionReason());

        return dto;
    }

}
