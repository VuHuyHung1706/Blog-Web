import axios from 'axios';

const API_URL = 'http://localhost:8080/api/posts';

export const getPosts = () => {
    return axios.get(API_URL);
};

export const createPost = (post) => {
    return axios.post(API_URL, post);
};

export const updatePost = (id, post) => {
    return axios.put(`${API_URL}/${id}`, post);
};

export const deletePost = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

export const uploadImage = (formData) => {
    return axios.post('http://localhost:8080/api/posts/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
