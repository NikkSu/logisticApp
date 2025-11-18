package curs.dto;
import lombok.Data;
@Data
public class AdminSupplierDto {
    private Long id;
    private Long userId;
    private String companyName;
    private String inn;
    private String status;
}
