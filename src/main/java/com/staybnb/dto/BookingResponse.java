package com.staybnb.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private String listingCity;
    private String listingImage;
    private BigDecimal listingPricePerNight;
    private Long guestId;
    private String guestName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalPrice;
    private Integer numGuests;
    private String status;
    private LocalDateTime createdAt;
}
