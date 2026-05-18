-- In-app shoppable video feed (MP4 / HLS URL hosted on CDN or Supabase Storage)
alter table reels add column if not exists video_url text;

comment on column reels.video_url is 'Direct playable video URL for the mobile shoppable feed';
