package com.oastudio.api.service;

import com.oastudio.api.dto.request.AdminRequest;
import com.oastudio.api.dto.response.AuthResponse;

public interface AuthenticationService {

    AuthResponse login(AdminRequest request);
}