package com.example.j2ee_backend.service;

import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeocodeService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${vietmap.apiKey}")
    private String vietmapApiKey;

    private final DoctorRepository doctorRepository;

    public GeocodeService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // ============================================================
    // Cập nhật lat/lng cho bác sĩ chưa có
    // ============================================================
    @Transactional
    public void updateAllMissingCoordinates(double userLat, double userLng) {
        List<Doctor> allDoctors = doctorRepository.findAll();
        for (Doctor doc : allDoctors) {
            if (doc.getLat() == null || doc.getLng() == null || doc.getLat() == 0 || doc.getLng() == 0) {
                double[] coords = geocodeAddress(doc.getAddress(), userLat, userLng); // dùng tọa độ người dùng
                if (coords != null) {
                    doc.setLat(coords[0]);
                    doc.setLng(coords[1]);
                    doctorRepository.save(doc);
                    System.out.println("Đã cập nhật tọa độ cho " + doc.getFullName()
                            + " -> " + coords[0] + ", " + coords[1]);
                } else {
                    System.out.println("Không tìm được tọa độ cho " + doc.getAddress());
                }
            }
        }
    }

    // ============================================================
    // Lấy bác sĩ gần nhất trong bán kính
    // ============================================================
    public List<Doctor> findNearByDoctors(double userLat, double userLon, int topN, double radiusKm) {
        List<Doctor> allDoctors = doctorRepository.findAll()
                .stream()
                .filter(d -> d.getLat() != null && d.getLng() != null && d.getLat() != 0 && d.getLng() != 0)
                .collect(Collectors.toList());

        for (Doctor d : allDoctors) {
            double distance = getDistanceKm(userLat, userLon, d.getLat(), d.getLng());
            System.out.println(d.getFullName() + " cách " + distance + " km");
        }

        // Lọc theo bán kính
        List<Doctor> withinRadius = allDoctors.stream()
                .filter(d -> getDistanceKm(userLat, userLon, d.getLat(), d.getLng()) <= radiusKm)
                .sorted(Comparator.comparingDouble(d -> getDistanceKm(userLat, userLon, d.getLat(), d.getLng())))
                .collect(Collectors.toList());

        if (topN > 0 && withinRadius.size() > topN) return withinRadius.subList(0, topN);
        return withinRadius;
    }

    // ============================================================
    // Geocode bằng VietMap
    // ============================================================
    public double[] geocodeAddress(String address, double userLat, double userLng) {
        double minDistance = Double.MAX_VALUE;
        JsonNode bestFeature = null;

        try {
            String encoded = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://maps.vietmap.vn/api/search?api-version=1.1"
                    + "&apikey=" + vietmapApiKey
                    + "&text=" + encoded
                    + "&layers=address";

            System.out.println("VietMap URL: " + url);

            String json = restTemplate.getForObject(url, String.class);
            System.out.println("Json: " + json);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode features = mapper.readTree(json).path("data").path("features");

            if (!features.isArray() || features.size() == 0) return null;

            for (JsonNode feature : features) {
                JsonNode coords = feature.path("geometry").path("coordinates");
                JsonNode props = feature.path("properties");
                String region = props.path("region").asText("").toLowerCase();

                // Chỉ lấy các feature có label chứa TP.HCM
                if (region.contains("hồ chí minh") || region.contains("tp.hcm") || region.contains("thành phố hồ chí minh")) {
                    if (coords.isArray() && coords.size() >= 2) {
                        double lng = coords.get(0).asDouble();
                        double lat = coords.get(1).asDouble();
                        double distance = getDistanceKm(userLat, userLng, lat, lng); // so với người dùng

                        // Chọn feature gần người dùng nhất
                        if (distance < minDistance) {
                            minDistance = distance;
                            bestFeature = feature;
                        }
                    }
                }
            }

            if (bestFeature != null) {
                JsonNode coords = bestFeature.path("geometry").path("coordinates");
                double lng = coords.get(0).asDouble();
                double lat = coords.get(1).asDouble();
                System.out.println("Chọn tọa độ gần người dùng: " + lat + ", " + lng + " (cách " + minDistance + " km)");
                return new double[]{lat, lng};
            }

            System.out.println("Không tìm được tọa độ trong TP.HCM cho: " + address);
            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    // ============================================================
    // Tính khoảng cách Haversine
    // ============================================================
    private double getDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
