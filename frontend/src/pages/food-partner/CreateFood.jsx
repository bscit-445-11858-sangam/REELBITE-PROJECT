import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/create-food.css';
import { useNavigate } from 'react-router-dom';

const CreateFood = () => {
    const [ name, setName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ videoFile, setVideoFile ] = useState(null);
    const [ videoURL, setVideoURL ] = useState('');
    const [ fileError, setFileError ] = useState('');
    const [ isUploading, setIsUploading ] = useState(false);
    const [ showSuccessModal, setShowSuccessModal ] = useState(false);
    const [ uploadError, setUploadError ] = useState('');
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    /** Multipart field name must match backend: upload.single("video") */
    const FOOD_VIDEO_FIELD = 'video';
    const UPLOAD_URL = 'http://localhost:3000/api/food';
    const UPLOAD_TIMEOUT_MS = 300000; /* 5 min — large video files */

    useEffect(() => {
        if (!videoFile) {
            setVideoURL('');
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [ videoFile ]);

    const onFileChange = (e) => {
        const file = e.target.files && e.target.files[ 0 ];
        if (!file) { setVideoFile(null); setFileError(''); return; }
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[ 0 ];
        if (!file) { return; }
        if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const openFileDialog = () => fileInputRef.current?.click();

    const handleUpload = async () => {
        if (isUploading) return;
        if (!name.trim() || !videoFile) return;

        setUploadError('');

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append(FOOD_VIDEO_FIELD, videoFile);

        setIsUploading(true);
        try {
            const { data } = await axios.post(UPLOAD_URL, formData, {
                withCredentials: true,
                timeout: UPLOAD_TIMEOUT_MS,
                /* Let the browser set multipart boundary — do not set Content-Type manually */
            });

            console.log(data);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            let message = 'Upload failed. Please try again.';
            if (err.code === 'ECONNABORTED') {
                message = 'Upload timed out. Try a smaller file or check your connection.';
            } else if (err.response?.data) {
                const d = err.response.data;
                if (typeof d === 'string') message = d;
                else if (d.message) message = Array.isArray(d.message) ? d.message.join(', ') : String(d.message);
                else if (d.error) message = typeof d.error === 'string' ? d.error : message;
            } else if (err.message) {
                message = err.message;
            }
            setUploadError(message);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleUpload();
    };

    const handleSuccessOk = () => {
        setShowSuccessModal(false);
        setUploadError('');
        setName('');
        setDescription('');
        setVideoFile(null);
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        navigate("/");
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile || isUploading, [ name, videoFile, isUploading ]);

    return (
        <div className="create-food-page">
            <div className="create-food-card">
                <header className="create-food-header">
                    <h1 className="create-food-title">Create Food</h1>
                    <p className="create-food-subtitle">Upload a short video, give it a name, and add a description.</p>
                </header>

                <form className="create-food-form" onSubmit={onSubmit} aria-busy={isUploading}>
                    <div className="field-group create-food-upload-block">
                        <label htmlFor="foodVideo">Food Video</label>
                        <input
                            id="foodVideo"
                            ref={fileInputRef}
                            className="file-input-hidden"
                            type="file"
                            accept="video/*"
                            onChange={onFileChange}
                        />

                        <div
                            className="file-dropzone"
                            role="button"
                            tabIndex={0}
                            aria-label="Upload video: tap or drag and drop"
                            onClick={openFileDialog}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileDialog(); } }}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            <div className="file-dropzone-inner">
                                <div className="file-dropzone-icon-wrap" aria-hidden="true">
                                    <svg className="file-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div className="file-dropzone-text">
                                    <strong>Tap to upload</strong>
                                    <span className="file-dropzone-sep"> / </span>
                                    <span>drag &amp; drop</span>
                                </div>
                                <div className="file-hint">MP4, WebM, MOV • Up to ~100MB</div>
                            </div>
                        </div>

                        {fileError && <p className="error-text" role="alert">{fileError}</p>}

                        {videoFile && (
                            <div className="file-chip" aria-live="polite">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" />
                                </svg>
                                <span className="file-chip-name">{videoFile.name}</span>
                                <span className="file-chip-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
                                <div className="file-chip-actions">
                                    <button type="button" className="btn-ghost" onClick={openFileDialog}>Change</button>
                                    <button type="button" className="btn-ghost danger" onClick={() => { setVideoFile(null); setFileError(''); }}>Remove</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {videoURL && (
                        <div className="video-preview">
                            <video className="video-preview-el" src={videoURL} controls playsInline preload="metadata" />
                        </div>
                    )}

                    <div className="field-group">
                        <label htmlFor="foodName">Name</label>
                        <input
                            id="foodName"
                            type="text"
                            placeholder="e.g., Spicy Paneer Wrap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="foodDesc">Description</label>
                        <textarea
                            id="foodDesc"
                            rows={4}
                            placeholder="Write a short description: ingredients, taste, spice level, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {uploadError && (
                        <p className="error-text create-food-upload-error" role="alert">
                            {uploadError}
                        </p>
                    )}

                    <div className="form-actions">
                        <button
                            className={`btn-primary${isUploading ? ' btn-primary--uploading' : ''}`}
                            type="submit"
                            disabled={isDisabled}
                            aria-disabled={isDisabled}
                            aria-busy={isUploading}
                        >
                            {isUploading ? (
                                <span className="btn-primary__inner">
                                    <span className="create-food-spinner" aria-hidden="true" />
                                    <span>Uploading video…</span>
                                </span>
                            ) : (
                                'Save Food'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {showSuccessModal && (
                <div
                    className="create-food-modal-backdrop"
                    role="presentation"
                    onClick={handleSuccessOk}
                >
                    <div
                        className="create-food-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-food-success-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p id="create-food-success-title" className="create-food-modal__message">
                            ✅ Video Uploaded Successfully
                        </p>
                        <button
                            type="button"
                            className="create-food-modal__ok"
                            onClick={handleSuccessOk}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateFood;