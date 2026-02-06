
import React from 'react';
import { Article, Edition } from './types';

export const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'Health',
    title: 'Nurturing Wellness in a Fast-Paced World',
    excerpt: 'How Brazilian expats are maintaining their traditional diet and fitness routines in American metropolitan areas.',
    author: {
      name: 'Juliana M.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB88YxwtickmiVPcgkGM1ZmNYrkGZ1XCeU18Wc0lBlxALutYBSfPLl6vaPAdOlBqcjMailc321r84yYdQelLUAWMwq3OWT3DTRO06gskcGVxb2tfEAMm6X86qaQmxjv5DEOkJxhVgMTWGW_BGzO35vsXUWAJ1nF_3QrOzrsDJVS6z5ikiceorFzH2Mlegk5sLcVtvqlhZmCgzTQUJMqgSGHfSxMS3jVPjMB_lGEz9tx_O7nZnRrneEtAMYuWpgAMtvAuM613AjTz1M',
    },
    readTime: '5 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxE3IX1_rpnb1s0ks1_3E_pvHhqmPQ5UmaUwNk3gzsRGojxvAZINxntyw0KTfaQYZvXyJzm5RfHWuAKXXbyzEh_DohcjtsbkFzq9GKyqjJfR_xyaeI0Luhqc5qXaDXQ-2SHhAMj_afLQ48Od1DxuGoG4oJ-EjtO9ANpOzYafE_LxPwtud-Q1LskhWTHWtgt7uoD4eRQdUE-8jgkF1TLUYsBBnk1v_jyVn6CBhJl8nMGnSslpahy0M3hkvPiMKun6sWLLWqYQ02cUg',
  },
  {
    id: '2',
    category: 'Business',
    title: 'The New Era of Brazilian Entrepreneurship',
    excerpt: 'A look at the innovative startups founded by Brazilians that are disrupting the tech scene in Silicon Valley.',
    author: {
      name: 'Ricardo Lima',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqo7rZCmDQn5zSZpX1Pfc0j3BSDfTuUZGMIWsd3hk_orMafVAslhfujOexSFXhBAzniwkSxjoyQXnCnZmT7TSWIVeHDpNoXXxh_riZufv0d-COVGaxt9FML913VI5C0469JvDvtkwDlp8kQ_C5lNpGah7hZ3Pe-ZUu52hqAXw80lUWtOWpvssoDFtA6_SR0JenVRv9n2oYL4pucMwss_M2JN4snYPJozBzyNwMgyIm4HlJI7fvJRfah1F2CjZlsMzBlNl4kd75fuo',
    },
    readTime: '8 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd2Bzmz6ZRbY9wRn0cm8Fozqm0cLL3Z6ifTAmrPDimOtr2qST5rP64f83A0oYitHiUo35meJsKzaOPNfdRkqDm_q11eGuCwMRqJZFLnjl6ldpM-iVb4NBrrj5gPx6yl_6FsXKYU-txtzc0_61yRKXmIwVeaOQIlzlZNndSTQ8Sg26kmQeEh0-vBw3Ld9rJqqwk8atBHUGYQgCfnByb4MdBJtxglCc5_9KWcgzCYyiAPTcdPTNq-YCFku5JTQ12EflyRv2ukN9aMS8',
  },
  {
    id: '3',
    category: 'Lifestyle',
    title: 'Cultural Hubs: Where Tradition Meets Modernity',
    excerpt: 'Discovering the secret spots in Florida that keep the authentic Brazilian lifestyle alive through art and food.',
    author: {
      name: 'Ana Costa',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjPxdbkduRPgvcjBZktj3JBeqfyEXdF9KuwARC5MyVCN8rpZPdBFYg6ZZCbf5o7Va7KzCf-uOl2fRsAiOMZm5lvPOEBZsttztQPxXneo1bK2FVK3TAJEzQPxsPl2OG6E0Bft6DbTNMIuFB2yKluv8e-lobR9l_xS3J6Dj50SO6x4P61klh3foxGLlv29aieK7pflaI2NoOXeV4gqgL6pZI_g-xHqcTTZHHinjKkq8A_9HCUN8nP1mYLHwCkWevvrUhy-F1ml6XfhQ',
    },
    readTime: '6 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAleGUkC_dZuh6dzVAz31C1cqCYy3GcHy6NLUpvEe96f2a4Rd675kOi7IzAn7JNw-eQ4PDOnFgFJcxTwVU-ORvDNvXHY9qMIkVKc_oyN7xxboc0xGQoWpDFjJboT7b4U3NwyplpSdu7NyEfQEQuEntGVso1fbQQ_XTIgs7WsZyV1GQcXLFYhLXqD-sc-WA3rCHXvETQmPLJbwA80dwVA10HQJ8iWi1Ywy-Tha__rFWygToqPKhWcSdmeTkFzCD8NvTsXJ0jNG_snQ0',
  },
  {
    id: '4',
    category: 'Wellness',
    title: 'Mindfulness and Movement: A Hybrid Approach',
    excerpt: 'Blending ancient techniques with modern fitness science to achieve mental clarity in a chaotic environment.',
    author: {
      name: 'Beatriz S.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn30UBE3oO8MEzaaE0OT3cCZMObx9Fi9jINo2CUvshZBbV0B5qacYZXipe3cohXBcOu-5B5gg8fjl0NmVq1Q9jZ4vfH-R7GsJ2YjmgwBsULFh48bH3nx27_npXNgK_UCulx4Fxs8wU4cq8ZfjcJqgv0O2ir2BPTx6d0qk0P91PEESR7lSKRBJZ2ZMDuhnz1RURjWOjnkotDKRvnui8-hzMxAufCiTx76da3kjW0kIXPtq5WfIrjs3hG0H1WDXaJWbb_1LVE2CAsEc',
    },
    readTime: '4 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlzkbNY04eUxt8SaqOzca_7iBy1GR25zLm7gm-Al_GJIjZFJWRDL08r1Ydeh4Q8v3eJUeC_Aqgb_LfKh7pXNh88TBer4xDhHuYlZkp3gHSZwsW6Fm7ezJ9SUPb5C63wlisGWwDhqWeymuYcF7qy-pZTEU5ImIM_Pgfk6JfXIxR4c_lCcMTbWvz5ot5pmUDWrPeVapBTspCHvfW1y5fvaacYdc5p40pqWLEWXWuBD1i_tZt0PcTHVJBpVcv4R1sXFA3R517UCRLZYs',
  },
  {
    id: '5',
    category: 'Events',
    title: 'Carnaval 2024: The Road to Success',
    excerpt: 'How community leaders organized the largest Brazilian festival in the history of the Tri-State area.',
    author: {
      name: 'Marcos G.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-67vH7GFVosGxxjmNMbzktILXX8SiMmdqdhaFUk4c9b4Ec-xOmUv5iLBjjp4iE7NaOfhIXdp5XdyHywGvG5TV2B0iaVj-hfF0gYgeXSC4ZJdapQBLK4ZFFkPf8HN3UYl5-TQE02Txj-nwk8t3akwDVZ_h7GHFnakq0L72vAPGZN6xfDrdxOYxt_p4j4EUS-hg8t6B78V5RvW27RTLb4e-B8IqV5cXxcpBc1-hKSYDNP01RKvKfcFqTzbCM9tlp1kwfdjr963G6Ho',
    },
    readTime: '10 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbHSasr-GYlIGflnEmtJ0g6dmHDAwaD2S5n7ix_Tjd7zC4243YDofCuNntgUflRNgcX2RsAtABsheNTdpzLjdBXa1L_5CBepqi1MsWEZQ0gqmuMRFUip_9RQuT9HN_TM6fUTtP5HrweGPxtXchvnd1mkWlIq-XAsjrAAV71fcMu3ECc-6A4GDOiUhsQeyS82UWgDvZYZXi8WOQpBxG4EnUCp3JDl_CkQ7reGKpw1_e_9PsibFV8z8EGmquXSr8ZeUYO--3Po9O8Ew',
  }
];

export const EDITIONS: Edition[] = [
  {
    id: 'e1',
    title: 'Cultural Heritage',
    number: 'EDITION #42',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1luo8ZAPRxs5W2b9ofIMisKkJWzOtAdLnU4w00aBeBCpfByBTvJ6PsL5uPEGH2fb2TOKo8GDNKA8vr4huDnx6NT3uu5PC-vnQk5SyZf387ywMETvhPao4Y7QFKmO2z4sy1buPV54nBuGULzOFaVSVY-4gflXzoTWyl5INJTtk_0s5DtmnC1tT2SPV0XWdf08v0t28qjM49Lls5OvURGiDDBrdyQRYreQSCg3DEDBtlwQyXSKfjj_-BRkJICbv8zovKV3FXVdcyVA',
  },
  {
    id: 'e2',
    title: 'Economic Growth',
    number: 'EDITION #41',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrDJfUcx7qZEBhKM15fBEkBzNpQHGw9SZhY-hAxB5zl_41JcZ4HPzguqK4Zb2Sl2kTYtnZQqMoUe1OjFc-yUc9jkqO6LyL2DlBYBj0J_lhHCDjzjwvK8NCDScFDUFJmz35R3abANxdKRo8H3GJzL2ByZcgHQTt-aiG_rM0jtHwLlmCH7vi3upp6MS6rmI9wX7uWpSzjskfKcrtKlDA0yf_cl7xYRRuh0XJa16NAjHuVIklICXmCtxn3_Voty5S28mkd-Piv5rzqrU',
  },
  {
    id: 'e3',
    title: 'Student Life',
    number: 'EDITION #40',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4HPIf7d1L3L-DkVHAOMIA4ZHubzVlr1YVT7h5B0mTQa7fRJGynOREsNUzT1qcp2Gg2kU3hfkZzSCNA3tY4clxxhx_3SWRS9cQwjgGjYp7JbPXfkYAHUS33RG8ybLXfguGtisq7MmWDWV31Li-zdEvLcYjEB-5L4_4UdvsEv8xu5GWoRseVZmb8iieTS9EDqcygxAR0oYcqgdXUKSjwIJ_Nv1t-b3f3lEbG2et0l2A7FUQPKRq3gn59NZU6vnfRIqEKVnVF5NhOPw',
  },
  {
    id: 'e4',
    title: 'Tech Innovations',
    number: 'EDITION #39',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEh3mHTBBHRhPY8IXYF7rT5fM3soiFLsbvewDEDmX0vn-a6-GaoTfsNlOkDsop4vwHM86ImX9ix7Lzlw9LilowjreCew2dqk-3rySoUbtj8y2V9r9kg0nhel1ipiZO-mr5u_wwysDNoY31ArdUFNbn5W-3vxBTk1w5e5ZiKrGZP2xfxNyoj7k8BZhk2IUVrLw99OXx_1X20EuXwAiignLWgECUWgqkVSiulgPup7WHDwExAxHsBstXqL4Qi-arnIJiUIyS-dzqg5g',
  }
];

export const LogoSVG = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
  </svg>
);
