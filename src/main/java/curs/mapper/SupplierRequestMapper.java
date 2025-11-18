package curs.mapper;

import curs.dto.SupplierRequestDto;
import curs.model.SupplierRequest;
import org.springframework.stereotype.Component;

@Component
public class SupplierRequestMapper {

    public SupplierRequestDto toDto(SupplierRequest req) {
        SupplierRequestDto dto = new SupplierRequestDto();

        dto.setId(req.getId());
        dto.setUserId(req.getUser().getId());
        dto.setUsername(req.getUser().getUsername());

        dto.setCompanyName(req.getCompanyName());
        dto.setInn(req.getInn());
        dto.setAddress(req.getAddress());
        dto.setDescription(req.getDescription());
        dto.setWebsite(req.getWebsite());
        dto.setPhone(req.getPhone());

        dto.setApproved(req.isApproved());
        dto.setRejected(req.isRejected());
        dto.setRejectionReason(req.getRejectionReason());

        return dto;
    }
}
