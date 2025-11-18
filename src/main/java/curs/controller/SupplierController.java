package curs.controller;

import curs.dto.SupplierRequest;
import curs.model.Supplier;
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

    private User getUser(Principal principal) {
        return userService.findByUsername(principal.getName());
    }

    @PostMapping("/apply")
    public Supplier apply(@RequestBody SupplierRequest request, Principal principal) {
        return supplierService.apply(getUser(principal), request);
    }

    @GetMapping("/status")
    public Supplier getStatus(Principal principal) {
        return supplierService.getStatus(getUser(principal));
    }
}
