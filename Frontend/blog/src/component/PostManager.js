import React, { useState, useEffect } from 'react';
import { 
    Button, TextField, Container, Typography, Grid, Card, CardContent, Box, Modal, Backdrop, Fade, Snackbar, Pagination 
} from '@mui/material';
import { getPosts, createPost, updatePost, deletePost, uploadImage } from '../api';

const PostManager = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '' });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // For image preview
    const [editingPost, setEditingPost] = useState(null);
    const [errors, setErrors] = useState({ title: '', content: '' });
    const [open, setOpen] = useState(false);
    const [showPosts, setShowPosts] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [page, setPage] = useState(1);
    const postsPerPage = 4;

    // State cho xác nhận xóa
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

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
                setImagePreview(null); // Reset image preview
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
        const file = e.target.files[0];
        setImage(file);
        
        // Set the image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result); // Set the preview URL
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    // Khi nhấn nút xóa, mở hộp thoại xác nhận thay vì xóa ngay
    const handleDeleteClick = (post) => {
        setPostToDelete(post);
        setDeleteConfirmOpen(true);
    };

    const confirmDeletePost = async () => {
        try {
            await deletePost(postToDelete.id);
            setPosts(posts.filter(post => post.id !== postToDelete.id));
            setSnackbarMessage('Post deleted successfully!');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
        setDeleteConfirmOpen(false);
        setPostToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteConfirmOpen(false);
        setPostToDelete(null);
    };

    const handleEditPost = (post) => {
        setEditingPost({ ...post });
        setImage(null);  // Reset image for editing mode
        setImagePreview(post.imageUrl ? `http://localhost:8080${post.imageUrl}` : null); // Show existing image in preview if available
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingPost(null);
        setImage(null);
        setImagePreview(null); // Reset image preview
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
                setImagePreview(null); // Reset image preview
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
                    id="post-title" // Added ID
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
                    id="post-content" // Added ID
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
                <input 
                    id="post-image-upload" // Added ID
                    type="file" 
                    onChange={handleImageChange} 
                    accept="image/*" 
                />
                {imagePreview && (
                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} />
                    </div>
                )}
                <Button 
                    id="create-post-btn" // Added ID
                    variant="contained" 
                    color="primary" 
                    onClick={handleCreatePost}
                >
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
                                    <Button 
                                        id={`delete-post-${post.id}`} // Unique ID for delete button
                                        variant="outlined" 
                                        color="secondary" 
                                        onClick={() => handleDeleteClick(post)}
                                    >
                                        Delete
                                    </Button>
                                    <Button 
                                        id={`edit-post-${post.id}`} // Unique ID for edit button
                                        variant="outlined" 
                                        color="primary" 
                                        onClick={() => handleEditPost(post)}
                                    >
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
                            id={`edit-title-${editingPost?.id}`} // Unique ID for editing title
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
                            id={`edit-content-${editingPost?.id}`} // Unique ID for editing content
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
                        <div className="update_image" style={{ margin: '10px 0' }}>
                            <input 
                                id={`edit-image-upload-${editingPost?.id}`} // Unique ID for editing image upload
                                type="file" 
                                onChange={handleImageChange} 
                                accept="image/*" 
                            />
                            {imagePreview && (
                                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} 
                                    />
                                </div>
                            )}
                        </div>
                        <Button 
                            id={`update-post-btn-${editingPost?.id}`} // Unique ID for update button
                            variant="contained" 
                            color="primary" 
                            onClick={handleUpdatePost} 
                            sx={{ mr: 1 }}
                        >
                            Update Post
                        </Button>
                        <Button 
                            id={`cancel-edit-btn-${editingPost?.id}`} // Unique ID for cancel edit button
                            variant="outlined" 
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Fade>
            </Modal>


            {/* Modal xác nhận xóa */}
            <Modal 
                open={deleteConfirmOpen} 
                onClose={cancelDelete} 
                closeAfterTransition 
                BackdropComponent={Backdrop} 
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={deleteConfirmOpen}>
                    <Box 
                        sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)', 
                            width: 300, 
                            bgcolor: 'background.paper', 
                            boxShadow: 24, 
                            p: 4, 
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h6">Xác nhận xóa</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Bạn có chắc chắn muốn xóa bài viết này không?
                        </Typography>
                        <Box mt={3} display="flex" justifyContent="space-around">
                            <Button 
                                id="confirm-delete-btn" // Added ID for delete confirmation
                                variant="contained" 
                                color="error" 
                                onClick={confirmDeletePost}
                            >
                                Xóa
                            </Button>
                            <Button 
                                id="cancel-delete-btn" // Added ID for cancel delete
                                variant="outlined" 
                                onClick={cancelDelete}
                            >
                                Hủy
                            </Button>
                        </Box>
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
