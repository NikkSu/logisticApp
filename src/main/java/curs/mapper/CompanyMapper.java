package curs.mapper;

import curs.dto.CompanyDto;
import curs.model.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyDto toDto(Company company) {
        if (company == null) return null;

        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setAddress(company.getAddress());
        dto.setLogoPath(company.getLogoPath());
        dto.setDescription(company.getDescription());
        dto.setOwnerId(company.getOwner()!=null ? company.getOwner().getId() : null);
        return dto;
    }

    public Company toEntity(CompanyDto dto) {
        if (dto == null) return null;

        Company company = new Company();
        company.setId(dto.getId());
        company.setName(dto.getName());
        company.setAddress(dto.getAddress());
        company.setLogoPath(dto.getLogoPath());
        company.setDescription(dto.getDescription());
        return company;
    }

    public void updateEntity(Company company, CompanyDto dto) {
        if (dto.getName() != null) company.setName(dto.getName());
        if (dto.getAddress() != null) company.setAddress(dto.getAddress());
        if (dto.getLogoPath() != null) company.setLogoPath(dto.getLogoPath());
        if (dto.getDescription() != null) company.setDescription(dto.getDescription());
    }
}
