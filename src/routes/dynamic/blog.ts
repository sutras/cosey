import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/blog',
  name: 'Blog',
  component: LayoutBase,
  meta: {
    title: 'post.blog',
    icon: 'bi bi-journal-richtext',
    authority: (ability) =>
      ability.can('read', 'blog_type') ||
      ability.can('read', 'blog_post') ||
      ability.can('read', 'blog_comment'),
  },
  children: [
    {
      path: 'post-types',
      name: 'BlogPostTypes',
      component: () => import('@/views/blog/post-types/index.vue'),
      meta: {
        title: 'post.categories',
        icon: 'bi bi-tags',
        authority: (ability) => ability.can('read', 'blog_type'),
      },
    },
    {
      path: 'posts',
      name: 'BlogPosts',
      component: () => import('@/views/blog/posts/index.vue'),
      meta: {
        title: 'post.articles',
        icon: 'bi bi-file-earmark-text',
        authority: (ability) => ability.can('read', 'blog_post'),
      },
    },
    {
      path: 'post-comments',
      name: 'BlogPostComments',
      component: () => import('@/views/blog/post-comments/index.vue'),
      meta: {
        title: 'post.comments',
        icon: 'bi bi-chat-dots',
        authority: (ability) => ability.can('read', 'blog_comment'),
      },
    },
  ],
});
