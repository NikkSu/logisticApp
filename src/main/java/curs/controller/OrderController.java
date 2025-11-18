package curs.controller;

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
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest req, Principal principal) {
        Long userId = serviceUserId(principal);
        List<OrderItem> items = req.getItems().stream()
                .map(i -> {
                    OrderItem oi = new OrderItem();
                    oi.setProductName(i.getProductName());
                    oi.setQuantity(i.getQuantity());
                    oi.setPrice(i.getPrice());
                    return oi;
                }).toList();

        OrderDTO dto = service.createOrder(userId, req.getSupplierId(), items);
        return ResponseEntity.ok(dto);
    }

    private Long serviceUserId(Principal principal) {

        return service.getUserIdByUsername(principal.getName());
    }

    @Data
    public static class CreateOrderRequest {
        private Long supplierId;
        private List<Item> items;
        @Data
        public static class Item {
            private String productName;
            private int quantity;
            private double price;
        }
    }
}
