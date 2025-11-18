package curs.mapper;

import curs.dto.CompanyRequestDto;
import curs.model.CompanyRequest;
import org.springframework.stereotype.Component;

@Component
public class CompanyRequestMapper {

    public CompanyRequestDto toDto(CompanyRequest req) {
        if (req == null) return null;
        CompanyRequestDto dto = new CompanyRequestDto();
        dto.setId(req.getId());
        if (req.getRequester() != null) {
            dto.setRequesterId(req.getRequester().getId());
            dto.setRequesterUsername(req.getRequester().getUsername());
        }
        if (req.getCompany() != null) {
            dto.setCompanyId(req.getCompany().getId());
            dto.setCompanyName(req.getCompany().getName());
        }
        dto.setStatus(req.getStatus());
        return dto;
    }
}
