import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://movielink-hub.web.app';
  
  // Static routes
  const routes = [
    '',
    '/search',
    '/genres',
    '/account',
    '/auth',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Common Genres to include for better indexing
  const commonGenres = [
    { id: '28', name: 'Action', type: 'movie' },
    { id: '35', name: 'Comedy', type: 'movie' },
    { id: '27', name: 'Horror', type: 'movie' },
    { id: '16', name: 'Animation', type: 'movie' },
    { id: '10749', name: 'Romance', type: 'movie' },
  ].map((genre) => ({
    url: `${baseUrl}/genre/${genre.id}?name=${genre.name}&type=${genre.type}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...commonGenres];
}
