import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/sign-up-login-screen'];

const CUSTOMER_ROUTES = [
  '/customer-dashboard',
  '/reservations',
  '/loyalty',
  '/customers',
  '/settings',
];

const STAFF_ROUTES = [
  '/',
  '/staff-dashboard',
  '/reservations',
  '/live-sessions',
  '/customers',
  '/waiting-list',
];

const MANAGER_ROUTES = [
  ...STAFF_ROUTES,
  '/inventory',
  '/rooms',
  '/reports',
  '/hardware',
  '/lost-found',
];

const OWNER_ROUTES = [
  ...MANAGER_ROUTES,
  '/sales',
  '/expenses',
  '/staff',
  '/staff-attendance',
  '/loyalty',
  '/feedback',
  '/audit-logs',
  '/settings',
  '/maintenance',
];

function canAccess(role: string, path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true;
  if (role === 'customer') return CUSTOMER_ROUTES.includes(path);
  if (role === 'staff') return STAFF_ROUTES.includes(path);
  if (role === 'manager') return MANAGER_ROUTES.includes(path);
  return role === 'owner' ? OWNER_ROUTES.includes(path) : false;
}

function homeFor(role: string): string {
  return role === 'customer' ? '/customer-dashboard' : '/';
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response; // not configured — let client surface the error

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.includes(path);

  if (!user) {
    // Unauthenticated: bounce protected pages to login (API routes are exempt).
    if (!isPublic && !path.startsWith('/api/')) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = '/sign-up-login-screen';
      return NextResponse.redirect(redirect);
    }
    return response;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'customer';

  if (isPublic) {
    // Already signed in — send to their home.
    const redirect = request.nextUrl.clone();
    redirect.pathname = homeFor(role);
    return NextResponse.redirect(redirect);
  }

  if (!canAccess(role, path)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = homeFor(role);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|images|.*\\.png$).*)',
  ],
};
