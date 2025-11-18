package curs.controller;

import curs.dto.CategoryDto;
import curs.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @PostMapping("/")
    public CategoryDto create(@RequestBody CategoryDto dto) {
        return service.create(dto);
    }

    @GetMapping("/tree")
    public List<CategoryDto> getTree() {
        return service.getTree();
    }

    @GetMapping("/{parentId}/children")
    public List<CategoryDto> getChildren(@PathVariable Long parentId) {
        return service.getChildren(parentId);
    }

    @PutMapping("/{id}")
    public CategoryDto update(@PathVariable Long id, @RequestBody CategoryDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
