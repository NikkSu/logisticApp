package curs.controller;

import curs.dto.CreateOrderRequest;
import curs.dto.OrderDTO;
import curs.service.OrderService;
import curs.model.OrderItem;
import lombok.Data;
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

    @GetMapping
    public ResponseEntity<?> getMyCompanyOrders(Principal principal) {
        return ResponseEntity.ok(service.getOrdersForUser(serviceUserId(principal)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOrderById(id));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest req, Principal principal) {
        Long userId = serviceUserId(principal);
        OrderDTO dto = service.createOrder(userId, req);
        return ResponseEntity.ok(dto);
    }

    private Long serviceUserId(Principal principal) {

        return service.getUserIdByUsername(principal.getName());
    }


}
