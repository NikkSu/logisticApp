package curs.controller;

import curs.dto.DeliveryInfoDTO;
import curs.mapper.DeliveryInfoMapper;
import curs.model.DeliveryInfo;
import curs.service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:3000")
public class DeliveryController {
    private final DeliveryService service;
    public DeliveryController(DeliveryService service) { this.service = service; }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculate(@RequestParam String origin, @RequestParam String destination) {
        DeliveryInfo d = service.calculateAndSave(origin, destination);
        return ResponseEntity.ok(DeliveryInfoMapper.toDTO(d));
    }
}
