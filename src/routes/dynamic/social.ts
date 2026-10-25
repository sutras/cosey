import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/social',
  name: 'Social',
  component: LayoutBase,
  meta: {
    title: 'social.social',
    icon: 'bi bi-people',
  },
  children: [
    {
      path: 'topics',
      name: 'SocialTopics',
      component: () => import('@/views/social/topics/index.vue'),
      meta: {
        title: 'social.topics',
        icon: 'bi bi-hash',
      },
    },
    {
      path: 'moments',
      name: 'SocialMoments',
      component: () => import('@/views/social/moments/index.vue'),
      meta: {
        title: 'social.moments',
        icon: 'bi bi-chat-square-text',
      },
    },
    {
      path: 'medals',
      name: 'SocialMedals',
      component: () => import('@/views/social/medals/index.vue'),
      meta: {
        title: 'social.medals',
        icon: 'bi bi-award',
      },
    },
    {
      path: 'props',
      name: 'SocialProps',
      component: () => import('@/views/social/props/index.vue'),
      meta: {
        title: 'social.props',
        icon: 'bi bi-bag',
      },
    },
    {
      path: 'gifts',
      name: 'SocialGifts',
      component: () => import('@/views/social/gifts/index.vue'),
      meta: {
        title: 'social.gifts',
        icon: 'bi bi-gift',
      },
    },
    {
      path: 'guilds',
      name: 'SocialGuilds',
      component: () => import('@/views/social/guilds/index.vue'),
      meta: {
        title: 'social.guilds',
        icon: 'bi bi-people-fill',
      },
    },
    {
      path: 'finances',
      name: 'SocialFinances',
      component: () => import('@/views/social/finances/index.vue'),
      meta: {
        title: 'social.finances',
        icon: 'bi bi-wallet2',
      },
    },
    {
      path: 'vips',
      name: 'SocialVips',
      component: () => import('@/views/social/vips/index.vue'),
      meta: {
        title: 'social.vips',
        icon: 'bi bi-gem',
      },
    },
  ],
});
