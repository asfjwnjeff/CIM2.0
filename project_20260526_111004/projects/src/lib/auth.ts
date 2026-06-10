import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cim2-secret-key-change-in-production-2024'
);
const TOKEN_NAME = 'cim_token';
const TOKEN_EXPIRY = '24h';

export interface TokenPayload {
  userId: string;
  username: string;
  realName: string;
  roleIds: string[];
  department?: string;
}

/** 签发 JWT Token */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/** 验证 JWT Token */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/** 设置 Token Cookie */
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24小时
  });
}

/** 删除 Token Cookie */
export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/** 从 Cookie 获取当前会话用户（无 cookie 时降级返回默认 admin） */
export async function getSessionUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload) return payload;
  }
  // 开发/内网模式：无 token 时返回内置管理员会话
  return getDefaultAdminSession();
}

/** 默认管理员会话（开发模式降级） */
function getDefaultAdminSession(): TokenPayload {
  return {
    userId: 'user-admin',
    username: 'admin',
    realName: '系统管理员',
    roleIds: ['role-admin'],
    department: '信息技术部',
  };
}

/** Token 名称常量 */
export { TOKEN_NAME };
