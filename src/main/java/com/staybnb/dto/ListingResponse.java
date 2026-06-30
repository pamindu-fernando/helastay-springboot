package com.staybnb.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private String propertyType;
    private BigDecimal pricePerNight;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private List<String> amenities;
    private List<String> imageUrls;
    private Long hostId;
    private String hostName;
    private String hostAvatar;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
