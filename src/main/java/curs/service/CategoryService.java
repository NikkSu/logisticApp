package curs.service;

import curs.dto.CategoryDto;
import curs.mapper.CategoryMapper;
import curs.model.Category;
import curs.repo.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repo;
    private final CategoryMapper mapper;

    public CategoryDto create(CategoryDto dto) {
        Category c = new Category();
        c.setName(dto.getName());
        c.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Category parent = repo.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            c.setParent(parent);
        }

        return mapper.toDto(repo.save(c));
    }

    public List<CategoryDto> getTree() {
        return repo.findByParentIsNull()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getChildren(Long parentId) {
        return repo.findByParentId(parentId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto update(Long id, CategoryDto dto) {
        Category exists = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        mapper.updateEntity(exists, dto);

        if (dto.getParentId() != null) {
            Category parent = repo.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
            exists.setParent(parent);
        }

        return mapper.toDto(repo.save(exists));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
