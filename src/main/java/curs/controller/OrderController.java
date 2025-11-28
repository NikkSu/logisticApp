package curs.controller;

import curs.dto.CheckoutRequest;
import curs.dto.CreateOrderRequest;
import curs.dto.OrderDTO;
import curs.service.OrderService;

import curs.model.OrderItem;
import lombok.Data;
import curs.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    private final OrderService service;
    private final OrderMapper mapper;

    @GetMapping
    public ResponseEntity<?> getMyCompanyOrders(Principal principal) {
        System.out.println(">>> PRINCIPAL = " + principal.getName());
        return ResponseEntity.ok(service.getOrdersForUser(serviceUserId(principal)));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Principal principal) {
        Long userId = serviceUserId(principal);
        return ResponseEntity.ok(service.getOrdersForCustomer(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOrderById(id));
    }
    // Покупатель меняет статус (например: RECEIVED, CANCELED)
    @PatchMapping("/user/orders/{id}/status")
    public ResponseEntity<?> changeUserOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal
    ) {
        service.changeUserOrderStatus(id, status, principal);
        return ResponseEntity.ok().build();
    }

    // Поставщик меняет статус (например: SHIPPED, ACCEPTED)
    @PatchMapping("/supplier/orders/{id}/status")
    public ResponseEntity<?> changeSupplierOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal
    ) {
        service.changeSupplierOrderStatus(id, status, principal);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/checkout")
    public List<OrderDTO> checkout(@RequestBody CheckoutRequest req, Principal p) {

        Long userId = service.getUserIdByPrincipal(p.getName());


        return service.checkout(userId, req.getLat(), req.getLng())
                .stream().map(mapper::toDto).toList();
    }


    private Long serviceUserId(Principal principal) {

        return service.getUserIdByPrincipal(principal.getName());
    }


}
