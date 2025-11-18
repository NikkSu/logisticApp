package curs.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private List<CategoryDto> children;
}
