import { Helmet } from 'react-helmet-async';

/**
 * Organization Schema for Fiber Agent homepage
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Fiber Agent',
    'url': 'https://fiberagent.shop',
    'logo': 'https://fiberagent.shop/logo.png',
    'description': 'AI shopping agent enabling autonomous agents to shop across 50,000+ merchants with on-chain rewards',
    'sameAs': [
      'https://x.com/fiber_shop',
      'https://github.com/fibershop/FiberAgent'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'email': 'support@fiber.shop'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

/**
 * SoftwareApplication Schema for Fiber Agent product
 */
export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Fiber Agent',
    'applicationCategory': 'CommerceSoftware',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Agentic commerce platform connecting AI agents to 50,000+ merchants on Monad blockchain',
    'url': 'https://fiberagent.shop',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '5',
      'ratingCount': '1'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

/**
 * BreadcrumbList Schema for navigation
 */
export function BreadcrumbSchema({ currentPage, currentPath }) {
  const breadcrumbs = {
    '/' : { name: 'Home', url: 'https://fiberagent.shop/' },
    '/about': { name: 'About', url: 'https://fiberagent.shop/about' },
    '/demo': { name: 'Demo', url: 'https://fiberagent.shop/demo' },
    '/agent': { name: 'For Agents', url: 'https://fiberagent.shop/agent' }
  };

  const itemListElement = Object.entries(breadcrumbs).map(([path, data], index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': data.name,
    'item': data.url
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': itemListElement
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
