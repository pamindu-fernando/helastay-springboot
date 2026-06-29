package com.staybnb.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long listingId;
    private Long guestId;
    private String guestName;
    private String guestAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}