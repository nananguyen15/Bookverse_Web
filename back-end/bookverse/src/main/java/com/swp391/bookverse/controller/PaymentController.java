package com.swp391.bookverse.controller;

import com.nimbusds.jose.shaded.gson.Gson;
import com.swp391.bookverse.configuration.VNPayConfig;
import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.PaymentCreationRequest;
import com.swp391.bookverse.dto.request.VNPayURLCreationRequest;
import com.swp391.bookverse.dto.response.PaymentResponse;
import com.swp391.bookverse.dto.response.VNPayURLResponse;
import com.swp391.bookverse.dto.response.TransactionStatusResponse;
import com.swp391.bookverse.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.util.*;

import static com.swp391.bookverse.configuration.VNPayConfig.*;

/**
 * @Author huangdat
 */

@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/api/payments")
public class PaymentController {
    PaymentService paymentService;

    @PostMapping("/create-payment-record")
    @PreAuthorize("hasAuthority('SCOPE_CUSTOMER')")
    public APIResponse<PaymentResponse> createPaymentRecord(@RequestBody PaymentCreationRequest request) {
        PaymentResponse paymentResponse = paymentService.createPayment(request);

        APIResponse<PaymentResponse> response = new APIResponse<>();
        response.setResult(paymentResponse);
        return response;
//        PaymentResponse paymentResponse = PaymentResponse.builder()
//                .id(1L)
//                .orderId(request.getOrderId())
//                .method(request.getMethod())
//                .status(null) // Set appropriate status
//                .amount(request.getAmount())
//                .paidAt(null) // Set paidAt if applicable
//                .createdAt(new Date().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
//                .build();
//
//        APIResponse<PaymentResponse> response = new APIResponse<>();
//        response.setResult(paymentResponse);
//        return response;
    }

    @PutMapping("/payment-done/{paymentId}")
    @PreAuthorize("hasAuthority('SCOPE_CUSTOMER')")
    public APIResponse<PaymentResponse> markPaymentAsDone(@PathVariable Long paymentId) {
        PaymentResponse paymentResponse = paymentService.markPaymentAsDone(paymentId);
        APIResponse<PaymentResponse> response = new APIResponse<>();
        response.setResult(paymentResponse);
        return response;
    }

    @PostMapping("/create-vnpay-url")
    public ResponseEntity<String> createPayment(@RequestBody VNPayURLCreationRequest request) throws UnsupportedEncodingException {

        String orderType = "other";
//        long amount = Integer.parseInt(req.getParameter("amount"))*100;
//        String bankCode = req.getParameter("bankCode");

        long amount = request.getAmountInVND() * 100;

        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        //String vnp_IpAddr = VNPayConfig.getIpAddress(req);
        String vnp_IpAddr = "171.246.74.195";

        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);


        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;

//        com.google.gson.JsonObject job = new JsonObject();
//        job.addProperty("code", "00");
//        job.addProperty("message", "success");
//        job.addProperty("data", paymentUrl);
//        Gson gson = new Gson();
//        resp.getWriter().write(gson.toJson(job));

        VNPayURLResponse vnPayURLResponse = new VNPayURLResponse();
        vnPayURLResponse.setStatus("OK");
        vnPayURLResponse.setMessage("Success");
        vnPayURLResponse.setURL(paymentUrl);

//        APIResponse<VNPayURLResponse> response = new APIResponse<>();
//        response.setResult(paymentResponse);
//        return response;


        APIResponse<VNPayURLResponse> response = new APIResponse<>();
        response.setResult(vnPayURLResponse);

        // convert Java object to JSON string
        String json = new Gson().toJson(response);

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(json);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<String> transaction(
            @RequestParam(value = "vnp_Amount") String amount,
            @RequestParam(value = "vnp_BankCode") String bankCode,
            @RequestParam(value = "vnp_BankTranNo") String bankTranNo,
            @RequestParam(value = "vnp_PayDate") String payDate,
            @RequestParam(value = "vnp_OrderInfo") String orderInfo,
            @RequestParam(value = "vnp_ResponseCode") String responseCode,
            @RequestParam(value = "vnp_TransactionNo") String transactionNo) {

        TransactionStatusResponse transactionStatusResponse = new TransactionStatusResponse();

        if (responseCode.equals("00")) {
            transactionStatusResponse.setStatus("OK");
            transactionStatusResponse.setMessage("Giao dịch thành công");
            transactionStatusResponse.setAmount(amount);
            transactionStatusResponse.setBankCode(bankCode);
            transactionStatusResponse.setBankTranNo(bankTranNo);
            transactionStatusResponse.setPayDate(payDate);
            transactionStatusResponse.setOrderInfo(orderInfo);
            transactionStatusResponse.setTransactionNo(transactionNo);
            transactionStatusResponse.setSuccess(true);
        } else {
            transactionStatusResponse.setStatus("NOT OK");
            transactionStatusResponse.setMessage("Giao dịch không thành công");
            transactionStatusResponse.setSuccess(false);
        }

        APIResponse<TransactionStatusResponse> response = new APIResponse<>();
        response.setResult(transactionStatusResponse);

        // Convert to JSON string
        String json = new Gson().toJson(response);

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(json);
    }




}
