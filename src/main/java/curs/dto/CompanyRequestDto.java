package curs.dto;

import curs.model.enums.CompanyRequestStatus;
import lombok.Data;

@Data
public class CompanyRequestDto {
    private Long id;
    private Long requesterId;
    private String requesterUsername;
    private Long companyId;
    private String companyName;
    private CompanyRequestStatus status;
}
