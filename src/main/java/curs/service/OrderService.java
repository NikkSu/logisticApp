package curs.service;

import curs.dto.CreateOrderRequest;
import curs.dto.OrderDTO;
import curs.dto.OrderDetailDTO;
import curs.mapper.OrderMapper;
import curs.model.*;
import curs.model.enums.OrderStatus;
import curs.repo.*;
import curs.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final SupplierRepository supplierRepo;
    private final OrderMapper mapper;
    private final CartItemRepository cartRepo;
    private final RouteService routeService;

    public List<OrderDTO> getOrdersForUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getCompany() == null)
            throw new RuntimeException("User has no company");

        return orderRepo.findByCompanyId(user.getCompany().getId())
                .stream().map(mapper::toDto).toList();
    }

    public OrderDetailDTO getOrderById(Long id) {
        return orderRepo.findById(id)
                .map(mapper::toDetailDto)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    public Long getUserIdByPrincipal(String principalName) {
        return userRepo.findByUsername(principalName)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    public List<OrderDTO> getOrdersForCustomer(Long userId) {
        return orderRepo.findByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }
    @Transactional
    public void changeUserOrderStatus(Long id, String status, Principal principal) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // проверяем что это заказ текущего пользователя
        if (!order.getUser().getUsername().equals(principal.getName())) {
            throw new RuntimeException("Access denied");
        }

        order.setStatus(OrderStatus.valueOf(status));
        orderRepo.save(order);
    }

    @Transactional
    public void changeSupplierOrderStatus(Long id, String status, Principal principal) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // проверяем что заказ действительно от его компании
        if (!order.getSupplier().getUser().getUsername().equals(principal.getName())) {
            throw new RuntimeException("Access denied");
        }

        order.setStatus(OrderStatus.valueOf(status));
        orderRepo.save(order);
    }


    @Transactional
    public List<Order> checkout(Long userId, double userLat, double userLng) {

        List<CartItem> cart = cartRepo.findAllByUserId(userId);

        if (cart.isEmpty())
            throw new RuntimeException("Корзина пуста");

        // группировка товаров по поставщикам
        Map<Supplier, List<CartItem>> grouped = cart.stream()
                .collect(Collectors.groupingBy(ci -> ci.getProduct().getSupplier()));

        List<Order> created = new ArrayList<>();

        for (Supplier sup : grouped.keySet()) {

            User customer = userRepo.getReferenceById(userId);
            Company customerCompany = customer.getCompany(); // может быть null — нормально для физлиц

// Координаты берем у поставщика, это нормально — он же доставляет
            Company supplierCompany = sup.getUser().getCompany();

            int seconds = routeService.calcDeliverySeconds(
                    supplierCompany.getLatitude(),
                    supplierCompany.getLongitude(),
                    userLat,
                    userLng
            );




            Order order = new Order();
            order.setCompany(customerCompany);
            order.setDate(LocalDate.now());
            order.setStatus(OrderStatus.CREATED);
            order.setSupplier(sup);
            order.setUser(userRepo.getReferenceById(userId));


            List<OrderItem> items = grouped.get(sup).stream()
                    .map(ci -> {
                        OrderItem oi = new OrderItem();
                        oi.setOrder(order);
                        oi.setProduct(ci.getProduct());
                        oi.setQuantity(ci.getQuantity());
                        oi.setPrice(ci.getProduct().getPrice());
                        return oi;
                    })
                    .toList();

            order.setItems(items);
            order.setTotalSum(
                    items.stream().mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity()).sum()
            );

            orderRepo.save(order);
            created.add(order);
        }

        cartRepo.deleteAllByUserId(userId); // очистить корзину

        return created;
    }





}
