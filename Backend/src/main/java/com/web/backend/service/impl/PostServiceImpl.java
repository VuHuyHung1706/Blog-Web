package com.web.backend.service.impl;

import com.web.backend.entity.Post;
import com.web.backend.repository.PostRepository;
import com.web.backend.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
    }

    @Override
    public Post createPost(Post post) {
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        if (post.getImageUrl() != null && !post.getImageUrl().isEmpty()) {
            post.setImageUrl(post.getImageUrl()); // Gán URL ảnh nếu có
        }

        return postRepository.save(post);
    }

    @Override
    public Post updatePost(Long id, Post post) {
        Post existingPost = getPostById(id);
        existingPost.setTitle(post.getTitle());
        existingPost.setContent(post.getContent());
        existingPost.setImageUrl(post.getImageUrl());
        existingPost.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(existingPost);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
