import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Typography, Grid, Card, CardContent, Box, Modal, Backdrop, Fade, Snackbar, Pagination } from '@mui/material';
import { getPosts, createPost, updatePost, deletePost, uploadImage } from '../api';

const PostManager = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '' });
    const [image, setImage] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [errors, setErrors] = useState({ title: '', content: '' });
    const [open, setOpen] = useState(false);
    const [showPosts, setShowPosts] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [page, setPage] = useState(1);
    const postsPerPage = 4;

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const response = await getPosts();
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const validate = () => {
        const newErrors = { title: '', content: '' };
        
        if (!newPost.title && !editingPost) {
            newErrors.title = 'Title is required';
        }
        if (!newPost.content && !editingPost) {
            newErrors.content = 'Content is required';
        }

        if (editingPost) {
            if (!editingPost.title) {
                newErrors.title = 'Title is required';
            }
            if (!editingPost.content) {
                newErrors.content = 'Content is required';
            }
        }
        
        setErrors(newErrors);
        return Object.values(newErrors).every((error) => error === '');
    };

    const handleCreatePost = async () => {
        if (validate()) {
            try {
                const post = { ...newPost };
                if (image) {
                    const imageUrl = await handleUploadImage(image);
                    post.imageUrl = imageUrl;
                }
                await createPost(post);
                setPosts([...posts, post]);
                setNewPost({ title: '', content: '', imageUrl: '' });
                setImage(null);
                setErrors({ title: '', content: '' });
                setSnackbarMessage('Post created successfully!');
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Error creating post:', error);
            }
        }
    };

    const handleUploadImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await uploadImage(formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleDeletePost = async (id) => {
        try {
            await deletePost(id);
            setPosts(posts.filter(post => post.id !== id));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEditPost = (post) => {
        setEditingPost({ ...post });
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingPost(null);
        setImage(null);
    };

    const handleUpdatePost = async () => {
        if (validate()) {
            try {
                const updatedPost = { ...editingPost };
                if (image) {
                    const imageUrl = await handleUploadImage(image);
                    updatedPost.imageUrl = imageUrl;
                }
                await updatePost(editingPost.id, updatedPost);
                setPosts(posts.map((p) => (p.id === editingPost.id ? updatedPost : p)));
                handleCloseModal();
                setImage(null);
                setErrors({ title: '', content: '' });
                setSnackbarMessage('Post updated successfully!');
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Error updating post:', error);
            }
        }
    };

    const togglePostsVisibility = () => {
        setShowPosts(prev => !prev);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const indexOfLastPost = page * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h3" align="center" gutterBottom>
                Blog
            </Typography>

            <Box mb={3}>
                <TextField
                    label="Title"
                    variant="outlined"
                    fullWidth
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    margin="normal"
                    error={!!errors.title}
                    helperText={errors.title}
                />
                <TextField
                    label="Content"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    margin="normal"
                    error={!!errors.content}
                    helperText={errors.content}
                />
                <input type="file" onChange={handleImageChange} accept="image/*" />
                <Button variant="contained" color="primary" onClick={handleCreatePost}>
                    Create Post
                </Button>
            </Box>

            <Typography variant="h4" align="center" gutterBottom>
                Danh sách bài viết
            </Typography>

            <Button variant="outlined" onClick={togglePostsVisibility}>
                {showPosts ? 'Hide Posts' : 'Show Posts'}
            </Button>

            {showPosts && (
                <Grid container spacing={3}>
                    {currentPosts.map((post) => (
                        <Grid item xs={12} key={post.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{post.title}</Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        {post.content}
                                    </Typography>
                                    {post.imageUrl && (
                                        <div className="image-container" style={{ textAlign: 'center', margin: '10px 0' }}>
                                            <img 
                                                src={`http://localhost:8080${post.imageUrl}`} 
                                                alt="Post" 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '300px', 
                                                    objectFit: 'contain',
                                                    borderRadius: '8px',
                                                }} 
                                            />
                                        </div>
                                    )}
                                    <Button variant="outlined" color="secondary" onClick={() => handleDeletePost(post.id)}>
                                        Delete
                                    </Button>
                                    <Button variant="outlined" color="primary" onClick={() => handleEditPost(post)}>
                                        Edit
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Pagination
                count={Math.ceil(posts.length / postsPerPage)}
                page={page}
                onChange={handleChangePage}
                color="primary"
                sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
            />

            <Modal open={open} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
                <Fade in={open}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Typography variant="h6">Edit Post</Typography>
                        <TextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            value={editingPost?.title || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                            margin="normal"
                            error={!!errors.title}
                            helperText={errors.title}
                        />
                        <TextField
                            label="Content"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={editingPost?.content || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                            margin="normal"
                            error={!!errors.content}
                            helperText={errors.content}
                        />
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        <Button variant="contained" color="primary" onClick={handleUpdatePost} sx={{ mr: 1 }}>
                            Update Post
                        </Button>
                        <Button variant="outlined" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                    </Box>
                </Fade>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </Container>
    );
};

export default PostManager;
