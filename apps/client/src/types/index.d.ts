// Type declarations for the application

declare module 'next' {
  export interface NextApiRequest {
    user?: {
      id: string;
      role: string;
      familyId?: string;
    };
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      familyId?: string;
    };
  }
}

// Global type for window
interface Window {
  // Add any global window properties here if needed
}

// Global type for NodeJS
namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL: string;
    // Add other environment variables as needed
  }
}
