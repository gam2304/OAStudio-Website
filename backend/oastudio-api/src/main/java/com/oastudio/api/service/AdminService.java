package com.oastudio.api.service;

import com.oastudio.api.dto.request.ChangePasswordRequest;
import com.oastudio.api.dto.request.CreateAdminRequest;
import com.oastudio.api.dto.request.ResetPasswordRequest;
import com.oastudio.api.dto.response.AdminResponse;

import java.util.List;

public interface AdminService {

    List<AdminResponse> getAllAdmins();

    AdminResponse createAdmin(CreateAdminRequest request);

    void deleteAdmin(Long id);

    void changeOwnPassword(String username, ChangePasswordRequest request);

    void resetPassword(Long id, ResetPasswordRequest request);
}
