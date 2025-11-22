// src/main/java/curs/mapper/SupplierRequestMapper.java
package curs.mapper;

import curs.dto.SupplierRequestDto;
import curs.model.SupplierRequest;
import org.springframework.stereotype.Component;

@Component
public class SupplierRequestMapper {

    public SupplierRequestDto toDto(SupplierRequest req) {
        if (req == null) return null;
        SupplierRequestDto dto = new SupplierRequestDto();
        dto.setId(req.getId());
        dto.setUserId(req.getUser() != null ? req.getUser().getId() : null);
        dto.setUsername(req.getUser() != null ? req.getUser().getUsername() : null);
        dto.setCompanyName(req.getCompanyName());
        dto.setInn(req.getInn());
        dto.setAddress(req.getAddress());
        dto.setDescription(req.getDescription());
        dto.setWebsite(req.getWebsite());
        dto.setPhone(req.getPhone());
        dto.setRejectionReason(req.getRejectionReason());
        dto.setStatus(req.getStatus() != null ? req.getStatus().name() : null);
        return dto;
    }
}
