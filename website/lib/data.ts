// Hand-crafted mock data for the curly testing API

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  company: string
}

export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

export interface Todo {
  id: number
  userId: number
  title: string
  completed: boolean
}

export interface Comment {
  id: number
  postId: number
  name: string
  email: string
  body: string
}

export const users: User[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    username: 'alice',
    email: 'alice@example.com',
    phone: '555-0101',
    website: 'alice.dev',
    company: 'TechCorp',
  },
  {
    id: 2,
    name: 'Bob Smith',
    username: 'bobsmith',
    email: 'bob@example.com',
    phone: '555-0102',
    website: 'bobsmith.io',
    company: 'DevStudio',
  },
  {
    id: 3,
    name: 'Carol Williams',
    username: 'carol',
    email: 'carol@example.com',
    phone: '555-0103',
    website: 'carolcodes.com',
    company: 'StartupXYZ',
  },
  {
    id: 4,
    name: 'David Brown',
    username: 'dbrown',
    email: 'david@example.com',
    phone: '555-0104',
    website: 'davidb.dev',
    company: 'CodeFactory',
  },
  {
    id: 5,
    name: 'Eva Martinez',
    username: 'eva_m',
    email: 'eva@example.com',
    phone: '555-0105',
    website: 'evamartinez.tech',
    company: 'InnovateLabs',
  },
]

export const posts: Post[] = [
  {
    id: 1,
    userId: 1,
    title: 'Getting Started with HTTP APIs',
    body: 'APIs are the backbone of modern web development. In this post, we explore the fundamentals of RESTful design and how to build intuitive endpoints.',
  },
  {
    id: 2,
    userId: 1,
    title: 'Why Command Line Tools Matter',
    body: 'The terminal is where developers spend a significant portion of their time. A well-designed CLI can dramatically improve productivity and developer experience.',
  },
  {
    id: 3,
    userId: 2,
    title: 'Load Testing Best Practices',
    body: 'Before deploying to production, understanding how your API performs under stress is crucial. Here are key metrics to monitor during load tests.',
  },
  {
    id: 4,
    userId: 2,
    title: 'JSON: The Universal Data Format',
    body: 'JSON has become the de facto standard for API communication. Its simplicity and readability make it ideal for both humans and machines.',
  },
  {
    id: 5,
    userId: 3,
    title: 'Authentication Patterns for APIs',
    body: 'From API keys to OAuth2, there are many ways to secure your endpoints. We compare the trade-offs of each approach.',
  },
  {
    id: 6,
    userId: 3,
    title: 'Retry Logic and Resilience',
    body: 'Networks are unreliable. Implementing smart retry logic with exponential backoff can make your applications more robust.',
  },
  {
    id: 7,
    userId: 4,
    title: 'Environment Variables Done Right',
    body: 'Managing configuration across environments is a common challenge. Learn how to use environment variables effectively.',
  },
  {
    id: 8,
    userId: 4,
    title: 'The Power of Shell Aliases',
    body: 'Repetitive commands slow you down. Creating aliases for common operations can save hours over time.',
  },
  {
    id: 9,
    userId: 5,
    title: 'Understanding HTTP Status Codes',
    body: 'From 200 OK to 503 Service Unavailable, status codes tell a story. Knowing what they mean helps with debugging.',
  },
  {
    id: 10,
    userId: 5,
    title: 'Curl vs Modern Alternatives',
    body: 'While curl is powerful, its syntax can be cryptic. Newer tools aim to provide the same functionality with better ergonomics.',
  },
]

export const todos: Todo[] = [
  { id: 1, userId: 1, title: 'Review pull request #42', completed: true },
  { id: 2, userId: 1, title: 'Write API documentation', completed: false },
  { id: 3, userId: 1, title: 'Set up CI/CD pipeline', completed: true },
  { id: 4, userId: 2, title: 'Refactor authentication module', completed: false },
  { id: 5, userId: 2, title: 'Add rate limiting', completed: false },
  { id: 6, userId: 2, title: 'Update dependencies', completed: true },
  { id: 7, userId: 3, title: 'Design new API endpoints', completed: false },
  { id: 8, userId: 3, title: 'Write unit tests', completed: true },
  { id: 9, userId: 3, title: 'Performance optimization', completed: false },
  { id: 10, userId: 4, title: 'Deploy to staging', completed: true },
  { id: 11, userId: 4, title: 'Configure monitoring alerts', completed: false },
  { id: 12, userId: 4, title: 'Database backup setup', completed: true },
  { id: 13, userId: 5, title: 'Security audit', completed: false },
  { id: 14, userId: 5, title: 'Load testing', completed: false },
  { id: 15, userId: 5, title: 'User feedback review', completed: true },
]

export const comments: Comment[] = [
  {
    id: 1,
    postId: 1,
    name: 'Great introduction!',
    email: 'reader1@example.com',
    body: 'This really helped me understand REST APIs better. The examples were clear and practical.',
  },
  {
    id: 2,
    postId: 1,
    name: 'Question about endpoints',
    email: 'curious@example.com',
    body: 'How do you handle versioning in your API design? Would love to see a follow-up post on that.',
  },
  {
    id: 3,
    postId: 2,
    name: 'CLI enthusiast',
    email: 'terminal_user@example.com',
    body: 'Totally agree! I spend 80% of my dev time in the terminal. Good CLI tools are game changers.',
  },
  {
    id: 4,
    postId: 3,
    name: 'DevOps perspective',
    email: 'ops@example.com',
    body: 'We use similar load testing strategies. The histogram visualization is particularly useful.',
  },
  {
    id: 5,
    postId: 3,
    name: 'Performance tip',
    email: 'perf_eng@example.com',
    body: 'Dont forget to test with realistic data sizes. Empty responses can give misleading results.',
  },
  {
    id: 6,
    postId: 5,
    name: 'OAuth2 fan',
    email: 'auth_expert@example.com',
    body: 'OAuth2 with PKCE is the way to go for SPAs. API keys are fine for server-to-server.',
  },
  {
    id: 7,
    postId: 6,
    name: 'Learned this the hard way',
    email: 'battle_tested@example.com',
    body: 'Exponential backoff saved our system during a third-party API outage. Essential pattern!',
  },
  {
    id: 8,
    postId: 9,
    name: 'Status code cheatsheet',
    email: 'webdev@example.com',
    body: '418 Im a teapot is my favorite. But seriously, proper status codes make debugging so much easier.',
  },
  {
    id: 9,
    postId: 10,
    name: 'Curl power user',
    email: 'curl_master@example.com',
    body: 'I still use curl for complex scenarios, but simpler tools are great for quick requests.',
  },
  {
    id: 10,
    postId: 10,
    name: 'New to APIs',
    email: 'newbie@example.com',
    body: 'As a beginner, the curl syntax was intimidating. Glad there are friendlier alternatives now.',
  },
]
