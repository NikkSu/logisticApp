package curs.controller;

import curs.dto.OrderDTO;
import curs.dto.OrderDetailDTO;
import curs.mapper.OrderMapper;
import curs.model.Supplier;
import curs.model.User;
import curs.repo.OrderRepository;
import curs.repo.SupplierRepository;

import curs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supplier/orders")
@RequiredArgsConstructor
public class SupplierOrderController {

    private final UserService userService;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper mapper;

    private User getUser(Principal p) {
        return userService.findByUsername(p.getName());
    }

    @GetMapping("")
    public List<OrderDTO> myOrders(Principal principal) {
        User u = getUser(principal);
        Supplier s = supplierRepository.findByUser(u)
                .orElseThrow(() -> new RuntimeException("Not a supplier"));

        return orderRepository.findBySupplier(s).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public OrderDetailDTO getOne(@PathVariable Long id, Principal principal) {
        User u = getUser(principal);
        Supplier s = supplierRepository.findByUser(u)
                .orElseThrow(() -> new RuntimeException("Not a supplier"));

        var order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSupplier().getId().equals(s.getId()))
            throw new RuntimeException("Not allowed");

        return mapper.toDetailDto(order);
    }
}
