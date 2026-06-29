package com.staybnb.repository;

import com.staybnb.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByGuestIdOrderByCreatedAtDesc(Long guestId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.listing.host.id = :hostId
        ORDER BY b.createdAt DESC
    """)
    List<Booking> findByHostIdOrderByCreatedAtDesc(@Param("hostId") Long hostId);

    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.listing.id = :listingId
          AND b.status IN ('PENDING', 'CONFIRMED')
          AND b.checkIn < :checkOut
          AND b.checkOut > :checkIn
    """)
    boolean existsConflictingBooking(
            @Param("listingId") Long listingId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.listing.id = :listingId
          AND b.guest.id = :guestId
          AND b.status = 'COMPLETED'
    """)
    boolean hasCompletedBooking(@Param("listingId") Long listingId, @Param("guestId") Long guestId);
}
