import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'echopod-hackathon-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }

  return null;
}

export function getUserFromRequest(request: Request): TokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
