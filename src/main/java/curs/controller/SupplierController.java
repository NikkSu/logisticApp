// src/main/java/curs/controller/SupplierController.java
package curs.controller;

import curs.dto.SupplierRequestDto;
import curs.mapper.SupplierRequestMapper;
import curs.model.SupplierRequest;
import curs.model.User;
import curs.service.SupplierService;
import curs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final UserService userService;
    private final SupplierRequestMapper supplierRequestMapper;

    private User getUser(Principal principal) {
        return userService.findByUsername(principal.getName());
    }

    @PostMapping("/apply")
    public SupplierRequestDto apply(@RequestBody SupplierRequestDto dto, Principal principal) {
        User user = getUser(principal);
        SupplierRequest req = supplierService.createRequest(user, dto);
        return supplierRequestMapper.toDto(req);
    }

    @GetMapping("/status")
    public SupplierRequestDto getStatus(Principal principal) {
        User user = getUser(principal);
        SupplierRequest req = supplierService.getStatus(user);
        return supplierRequestMapper.toDto(req);
    }
}
