import React, { useState, useEffect } from 'react';
import profileService from '../../api/profileService';

/**
 * Profile Manager Component
 * Demonstrates Profile Microservice Integration
 * 
 * Features:
 * - View current profile
 * - Update profile information
 * - Manage social links
 * - Create timeline posts
 */
const ProfileManager = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [postContent, setPostContent] = useState('');

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getMyProfile();
      
      if (response.success) {
        const profileData = response.data.profile;
        setProfile(profileData);
        setBio(profileData.bio || '');
        setInstagram(profileData.socialLinks?.instagram || '');
        setFacebook(profileData.socialLinks?.facebook || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const updateData = {
        bio,
        socialLinks: {
          instagram,
          facebook
        }
      };
      
      const response = await profileService.upsertProfile(updateData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setProfile(response.data.profile);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const postData = {
        type: 'post',
        content: postContent
      };
      
      const response = await profileService.createTimelinePost(postData);
      
      if (response.success) {
        setSuccess('Post created successfully!');
        setPostContent('');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-manager p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Management</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading && <div className="text-center py-4">Loading...</div>}

      {/* Current Profile Display */}
      {profile && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Profile</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Bio:</strong> {profile.bio || 'No bio yet'}</p>
            <p><strong>Followers:</strong> {profile.followersCount}</p>
            <p><strong>Following:</strong> {profile.followingCount}</p>
            <p><strong>Posts:</strong> {profile.postsCount}</p>
            {profile.socialLinks && (
              <div className="mt-2">
                <strong>Social Links:</strong>
                <div className="ml-4">
                  {profile.socialLinks.instagram && (
                    <p>Instagram: {profile.socialLinks.instagram}</p>
                  )}
                  {profile.socialLinks.facebook && (
                    <p>Facebook: {profile.socialLinks.facebook}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Profile Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">{bio.length}/500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Handle
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="@yourusername"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Facebook username"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Create Timeline Post */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Create Timeline Post</h2>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share something with your followers..."
              maxLength={5000}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !postContent.trim()}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Posting...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileManager;
