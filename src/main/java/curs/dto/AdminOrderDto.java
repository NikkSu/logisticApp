package curs.dto;
import lombok.Data;
@Data
public class AdminOrderDto {
    private Long id;
    private String date;
    private double totalSum;
    private String status;
    private Long companyId;
    private Long userId;
}
