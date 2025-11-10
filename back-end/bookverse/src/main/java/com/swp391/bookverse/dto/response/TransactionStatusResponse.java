package com.swp391.bookverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

/**
 * @Author huangdat
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class TransactionStatusResponse implements Serializable {
    String status;
    String message;
    String amount;
    String bankCode;
    String bankTranNo;
    String payDate;
    String orderInfo;
    String transactionNo;
    boolean success;
}
