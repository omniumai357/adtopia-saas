'use client';

import React, { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadedFile {
  file: File;
  preview: string;
  niche: string;
  language: string;
  title: string;
  description: string;
  cta_type: string;
  fomo_score: number;
  is_featured: boolean;
}

interface MigrationLog {
  started_at: string;
  total_urls: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  cost_estimate: number;
  completed_at?: string;
  duration_minutes?: number;
}

export default function GammaUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [migrationLog, setMigrationLog] = useState<MigrationLog | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'migration'>('upload');

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      niche: 'white-label',
      language: 'en',
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      cta_type: 'value',
      fomo_score: 6,
      is_featured: false
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Update file metadata
  const updateFileMetadata = (index: number, field: keyof UploadedFile, value: any) => {
    setUploadedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload files to Supabase
  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileData = uploadedFiles[i];
        
        // Create storage path
        const storagePath = `${fileData.niche}/${fileData.language}/${fileData.file.name}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('gamma-cards')
          .upload(storagePath, fileData.file, {
            upsert: true,
            contentType: fileData.file.type
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Insert metadata into gamma_gallery table
        const { error: insertError } = await supabase
          .from('gamma_gallery')
          .insert({
            original_gamma_url: 'manual_upload',
            storage_path: storagePath,
            niche: fileData.niche,
            language: fileData.language,
            title: fileData.title,
            description: fileData.description,
            fomo_score: fileData.fomo_score,
            cta_type: fileData.cta_type,
            is_featured: fileData.is_featured,
            is_placeholder: false,
            utm_campaign: `${fileData.niche}_${fileData.cta_type}_manual`
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          continue;
        }

        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);
      }

      // Clear uploaded files
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
      setUploadedFiles([]);
      
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Load migration log
  const loadMigrationLog = async () => {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll simulate loading the log
      const mockLog: MigrationLog = {
        started_at: '2025-10-09T10:00:00',
        total_urls: 17,
        processed: 17,
        successful: 15,
        failed: 2,
        errors: [
          'API call failed: https://lupes-gourmet-tamales-ki0bb9s.gamma.site/',
          'ZIP extraction failed: https://coolfix-fresno-w6yxeky.gamma.site/'
        ],
        cost_estimate: 8.50,
        completed_at: '2025-10-09T10:45:00',
        duration_minutes: 45
      };
      setMigrationLog(mockLog);
    } catch (error) {
      console.error('Failed to load migration log:', error);
    }
  };

  // Gallery management
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const loadGalleryImages = async () => {
    setGalleryLoading(true);
    try {
      const { data, error } = await supabase
        .from('gamma_gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setGalleryLoading(false);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('gamma_gallery')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setGalleryImages(prev => prev.map(img => 
        img.id === id ? { ...img, is_featured: !currentFeatured } : img
      ));
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const deleteImage = async (id: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gamma-cards')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('gamma_gallery')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Update local state
      setGalleryImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gamma Gallery Management</h1>
          <p className="text-gray-600 mt-2">Upload, manage, and monitor your Gamma ad cards</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'upload', label: 'Upload Files' },
                { id: 'gallery', label: 'Gallery Management' },
                { id: 'migration', label: 'Migration Monitor' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop PNG/JPG files here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PNG, JPG, and other image formats
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
                {uploadedFiles.map((fileData, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={fileData.preview}
                        alt={fileData.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={fileData.title}
                            onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Niche</label>
                          <select
                            value={fileData.niche}
                            onChange={(e) => updateFileMetadata(index, 'niche', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="plumber">Plumber</option>
                            <option value="hvac">HVAC</option>
                            <option value="movers">Movers</option>
                            <option value="contractor">Contractor</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="white-label">White Label</option>
                            <option value="seasonal">Seasonal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Language</label>
                          <select
                            value={fileData.language}
                            onChange={(e) => updateFileMetadata(index, 'language', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">CTA Type</label>
                          <select
                            value={fileData.cta_type}
                            onChange={(e) => updateFileMetadata(index, 'cta_type', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="urgency">Urgency</option>
                            <option value="trust">Trust</option>
                            <option value="value">Value</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">FOMO Score</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={fileData.fomo_score}
                            onChange={(e) => updateFileMetadata(index, 'fomo_score', parseInt(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={fileData.description}
                            onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                            rows={2}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={fileData.is_featured}
                            onChange={(e) => updateFileMetadata(index, 'is_featured', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">Featured</label>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Upload Button */}
                <div className="flex justify-end">
                  <button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload All Files'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery Management Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Gallery Images</h3>
              <button
                onClick={loadGalleryImages}
                disabled={galleryLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {galleryLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((image) => (
                  <div key={image.id} className="bg-white rounded-lg border p-4">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <img
                        src={supabase.storage.from('gamma-cards').getPublicUrl(image.storage_path).data.publicUrl}
                        alt={image.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{image.title}</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Niche:</span> {image.niche}</p>
                      <p><span className="font-medium">Language:</span> {image.language}</p>
                      <p><span className="font-medium">CTA Type:</span> {image.cta_type}</p>
                      <p><span className="font-medium">FOMO Score:</span> {image.fomo_score}/10</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => toggleFeatured(image.id, image.is_featured)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          image.is_featured
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {image.is_featured ? 'Featured' : 'Feature'}
                      </button>
                      <button
                        onClick={() => deleteImage(image.id, image.storage_path)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No gallery images found. Upload some files first.</p>
              </div>
            )}
          </div>
        )}

        {/* Migration Monitor Tab */}
        {activeTab === 'migration' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Migration Monitor</h3>
              <button
                onClick={loadMigrationLog}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Load Migration Log
              </button>
            </div>

            {migrationLog ? (
              <div className="bg-white rounded-lg border p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{migrationLog.total_urls}</div>
                    <div className="text-sm text-gray-600">Total URLs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{migrationLog.successful}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{migrationLog.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${migrationLog.cost_estimate}</div>
                    <div className="text-sm text-gray-600">Cost Estimate</div>
                  </div>
                </div>

                {migrationLog.errors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      {migrationLog.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-800">{error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Started:</span> {new Date(migrationLog.started_at).toLocaleString()}</p>
                  {migrationLog.completed_at && (
                    <p><span className="font-medium">Completed:</span> {new Date(migrationLog.completed_at).toLocaleString()}</p>
                  )}
                  {migrationLog.duration_minutes && (
                    <p><span className="font-medium">Duration:</span> {migrationLog.duration_minutes.toFixed(1)} minutes</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No migration log found. Click "Load Migration Log" to view recent migrations.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
