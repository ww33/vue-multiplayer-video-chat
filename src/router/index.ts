import Vue from 'vue';
import VueRouter from 'vue-router';
import NotFound from '@/views/NotFound.vue';
import Home from "@/views/spheres/Home.vue";
import Room from "@/views/Room.vue";
import Space from "@/views/spheres/Space.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/space/:spaceId',
    name: 'space',
    component: Space,
    props: true
  },
  {
    path: '/room/:roomId',
    name: 'room',
    component: Room,
    props: true
  },
  {
    path: '*',
    component: NotFound
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue')
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
