package com.staybnb.controller;

import com.staybnb.dto.ApiResponse;
import com.staybnb.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<String>> upload(
            @RequestParam("files") List<MultipartFile> files) {
        return ApiResponse.ok("Files uploaded", fileService.uploadFiles(files));
    }

    @PostMapping("/upload/single")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<String> uploadSingle(
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok("File uploaded", fileService.uploadFile(file));
    }
}