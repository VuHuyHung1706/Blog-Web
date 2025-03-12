package com.web.backend.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

@RestController
public class ImageController {

    private static final String IMAGE_UPLOAD_DIR = "/Users/vhh1706/Data/BackEnd/WEB/Blog_Web/Backend/src/main/resources/static/uploads/";

    @GetMapping("/uploads/{filename}")
    public Resource getImage(@PathVariable String filename) {
        File file = new File(IMAGE_UPLOAD_DIR + filename);
        return new FileSystemResource(file);
    }
}

