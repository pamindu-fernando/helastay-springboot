package com.staybnb.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ListingRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be under 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Property type is required")
    private String propertyType;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "1.00", message = "Price must be at least $1")
    private BigDecimal pricePerNight;

    @NotNull(message = "Max guests is required")
    @Min(value = 1, message = "At least 1 guest required")
    private Integer maxGuests;

    @NotNull(message = "Bedrooms count is required")
    @Min(value = 0, message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @NotNull(message = "Bathrooms count is required")
    @Min(value = 0, message = "Bathrooms cannot be negative")
    private Integer bathrooms;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

    private Double latitude;
    private Double longitude;

    private List<String> amenities;
    private List<String> imageUrls;
}
