package curs.service;

import curs.model.DeliveryInfo;
import curs.repo.DeliveryInfoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DeliveryService {
    private final DeliveryInfoRepository repo;
    @Value("${google.api.key:}")
    private String apiKey;

    public DeliveryService(DeliveryInfoRepository repo) { this.repo = repo; }

    public DeliveryInfo calculateAndSave(String origin, String destination) {
        try {
            RestTemplate rt = new RestTemplate();
            if (apiKey == null || apiKey.isBlank()) {
                DeliveryInfo d = new DeliveryInfo();
                d.setOriginAddress(origin);
                d.setDestinationAddress(destination);
                d.setDistanceKm(100.0);
                d.setEstimatedTimeHours(48.0);
                return repo.save(d);
            }
            String url = String.format("https://maps.googleapis.com/maps/api/distancematrix/json?origins=%s&destinations=%s&key=%s",
                    java.net.URLEncoder.encode(origin, java.nio.charset.StandardCharsets.UTF_8),
                    java.net.URLEncoder.encode(destination, java.nio.charset.StandardCharsets.UTF_8),
                    apiKey);
            String resp = rt.getForObject(url, String.class);
            ObjectMapper om = new ObjectMapper();
            JsonNode root = om.readTree(resp);
            JsonNode elem = root.path("rows").get(0).path("elements").get(0);
            double distanceMeters = elem.path("distance").path("value").asDouble(0.0);
            double durationSec = elem.path("duration").path("value").asDouble(0.0);
            DeliveryInfo d = new DeliveryInfo();
            d.setOriginAddress(origin);
            d.setDestinationAddress(destination);
            d.setDistanceKm(distanceMeters / 1000.0);
            d.setEstimatedTimeHours(durationSec / 3600.0);
            return repo.save(d);
        } catch (Exception ex) {
            DeliveryInfo d = new DeliveryInfo();
            d.setOriginAddress(origin);
            d.setDestinationAddress(destination);
            d.setDistanceKm(0.0);
            d.setEstimatedTimeHours(0.0);
            return repo.save(d);
        }
    }
}
