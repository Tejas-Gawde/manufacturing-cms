import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  );
}

export function authMiddleware(requiredRoles) {
  return (req, res, next) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ error: "Missing token" });
      const decoded = verifyAccessToken(token);
      if (
        requiredRoles &&
        requiredRoles.length > 0 &&
        !requiredRoles.includes(decoded.role)
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
