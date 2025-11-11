import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import SurveyCard from './SurveyCard';
import TrendingNews from './TrendingNews';
import AnalyticsOverviewCard from './AnalyticsOverviewCard';
import EngagementChart from './EngagementChart';
import TopPostsTable from './TopPostsTable';
import AudienceInsights from './AudienceInsights';
import FollowerTrend from './FollowerTrend';
import '../styles/postCard.css';
import '../styles/postComposer.css';
import './ownerDashboard.css';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    views: 0,
    weekly: [],
    avgRating: 0,
    reviewsCount: 0,
    likes: 0,
    comments: 0,
    followers: 0,
    businesses: 0,
  });
  const [engagementTrend, setEngagementTrend] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [followerTrend, setFollowerTrend] = useState([]);
  const [posts, setPosts] = useState([]);
  const [surveys, setSurveys] = useState([]);

  const loadDashboard = async () => {
      try {
        const [
          statsRes,
          engagementRes,
          postsRes,
          geoRes,
          followerRes,
        ] = await Promise.all([
          api.get('/owner/stats'),
          api.get('/analytics/engagement?days=7'),
          api.get('/analytics/posts?limit=4'),
          api.get('/analytics/geo?limit=5'),
          api.get('/analytics/followers?days=7'),
        ]);

        const safeStats = {
          views: statsRes.data?.views || 0,
          weekly: Array.isArray(statsRes.data?.weekly) ? statsRes.data.weekly : [],
          avgRating: Number(statsRes.data?.avgRating || 0),
          reviewsCount: Number(statsRes.data?.reviewsCount || 0),
          likes: Number(statsRes.data?.likes || 0),
          comments: Number(statsRes.data?.comments || 0),
          followers: Number(statsRes.data?.followers || 0),
          businesses: Number(statsRes.data?.businesses || 0),
        };
        setStats(safeStats);
        setEngagementTrend(engagementRes.data || []);
        setTopPosts(postsRes.data || []);
        setCities(geoRes.data || []);
        setFollowerTrend(followerRes.data || []);
      } catch (error) {
        console.error('Failed to load analytics data', error);
      }
    };

  const loadFeed = async () => {
    try {
      const [postsRes, surveysRes] = await Promise.all([
        api.get('/posts'),
        api.get('/surveys/feed?limit=5'),
      ]);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      setSurveys(Array.isArray(surveysRes.data) ? surveysRes.data : []);
    } catch (error) {
      console.error('Failed to load feed', error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <main className="owner-social__feed">
      <section className="owner-social__top">
          <div className="panel analytics-panel analytics-panel--wide">
            <div className="panel-head">
              <div>
                <div className="panel-title">Engagement</div>
                <div className="panel-sub">Weekly views, comments, likes, and reviews</div>
              </div>
            </div>
            <EngagementChart data={engagementTrend} />
          </div>
          <div className="panel analytics-panel analytics-panel--stacked">
            <FollowerTrend data={followerTrend} />
            <TopPostsTable posts={topPosts} />
            <AudienceInsights cities={cities} />
          </div>
        </section>

        <section className="owner-social__kpis analytics-grid">
          <AnalyticsOverviewCard label="Businesses" value={stats.businesses} />
          <AnalyticsOverviewCard label="Views (week)" value={stats.views} />
          <AnalyticsOverviewCard label="Reviews" value={stats.reviewsCount} />
          <AnalyticsOverviewCard label="Avg rating" value={stats.avgRating.toFixed(1)} />
          <AnalyticsOverviewCard label="Followers" value={stats.followers} tone="purple" />
          <AnalyticsOverviewCard label="Comments" value={stats.comments} tone="green" />
        </section>

        <section className="owner-social__composer">
          <PostComposer onPost={(newPost) => setPosts((prev) => [newPost, ...prev])} />
        </section>

        <section className="owner-social__posts">
          {posts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </section>

      <section className="owner-social__surveys">
        <h3>Recent surveys</h3>
        {surveys.map((survey) => (
          <SurveyCard key={survey._id || survey.id} survey={survey} onVote={() => loadFeed()} />
        ))}
        <Link className="owner-social__surveys-link" to="/owner/surveys">
          View owner survey studio
        </Link>
      </section>
    </main>
  );
};

export default OwnerDashboard;
