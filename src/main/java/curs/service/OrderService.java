//package curs.service;
//
//import curs.dto.CreateOrderRequest;
//import curs.dto.OrderDTO;
//import curs.dto.OrderDetailDTO;
//import curs.mapper.OrderMapper;
//import curs.model.*;
//import curs.model.enums.OrderStatus;
//import curs.repo.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class OrderService {
//    private final OrderRepository orderRepo;
//    private final UserRepository userRepo;
//    private final SupplierRepository supplierRepo;
//    private final OrderMapper mapper;
//
//    public List<OrderDTO> getOrdersForUser(Long userId) {
//        User user = userRepo.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        if (user.getCompany() == null)
//            throw new RuntimeException("User has no company");
//
//        return orderRepo.findByCompanyId(user.getCompany().getId())
//                .stream().map(mapper::toDto).toList();
//    }
//
//    public OrderDetailDTO getOrderById(Long id) {
//        return orderRepo.findById(id)
//                .map(mapper::toDetailDto)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//    }
//    public Long getUserIdByUsername(String principalName) {
//        try {
//            Long id = Long.parseLong(principalName);
//            return userRepo.findById(id)
//                    .map(User::getId)
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//        } catch (NumberFormatException e) {
//            throw new RuntimeException("Invalid principal ID: " + principalName);
//        }
//    }
//
//
//
//    @Transactional
//    public OrderDTO createOrder(Long userId, CreateOrderRequest req) {
//        User user = userRepo.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        Supplier supplier = supplierRepo.findById(req.getSupplierId())
//                .orElseThrow(() -> new RuntimeException("Supplier not found"));
//
//        Order order = new Order();
//        order.setDate(LocalDate.now());
//        order.setStatus(OrderStatus.CREATED);
//        order.setUser(user);
//        order.setSupplier(supplier);
//        order.setCompany(user.getCompany());
//
//        List<OrderItem> items = req.getItems().stream()
//                .map(i -> {
//                    Product product = productRepo.findById(i.getProductId())
//                            .orElseThrow(() -> new RuntimeException("Invalid product"));
//
//                    OrderItem oi = new OrderItem();
//                    oi.setOrder(order);
//                    oi.setProduct(product);
//                    oi.setQuantity(i.getQuantity());
//                    return oi;
//                }).toList();
//
//
//        order.setItems(items);
//
//        orderRepo.save(order);
//
//        return mapper.toDto(order);
//    }
//
//}
