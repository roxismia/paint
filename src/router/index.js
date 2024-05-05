import { createRouter, createWebHistory } from 'vue-router';
import ThePaint from '../components/ThePaint.vue';


const routes = [
    {
        path: '/paint',
        name: 'ThePaint',
        component: ThePaint,
    },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;