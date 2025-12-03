package curs.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class RouteService {

    private final RestTemplate rest = new RestTemplate();

    public int calcDeliverySeconds(double fromLat, double fromLng,
                                   double toLat, double toLng) {

        String url = String.format(
            "http://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=false",
            fromLng, fromLat, toLng, toLat
        );

        try {
            var response = rest.getForObject(url, Map.class);
            var routes = (List<Map<String, Object>>) response.get("routes");
            double duration = (Double) routes.get(0).get("duration");
            return (int) duration; // seconds

        } catch (Exception e) {
            return 3600; // fallback 1 hour
        }
    }
}
