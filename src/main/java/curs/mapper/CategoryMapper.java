package curs.mapper;

import curs.dto.CategoryDto;
import curs.model.Category;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category c) {
        if (c == null) return null;

        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setParentId(c.getParent() != null ? c.getParent().getId() : null);

        if (c.getChildren() != null) {
            dto.setChildren(c.getChildren().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public void updateEntity(Category c, CategoryDto dto) {
        c.setName(dto.getName());
        c.setDescription(dto.getDescription());
    }
}
