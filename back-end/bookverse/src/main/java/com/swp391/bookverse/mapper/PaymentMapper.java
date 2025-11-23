package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.response.PaymentResponse;
import com.swp391.bookverse.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    // payment entity to payment dto mapping methods
    PaymentResponse toPaymentResponse(Payment payment);

}
