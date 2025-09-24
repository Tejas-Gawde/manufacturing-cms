import bcrypt from "bcrypt";
import { db } from "../db.js";
import { users } from "../schema/users.js";
import { eq } from "drizzle-orm";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendMail } from "../utils/mailer.js";
import { sql } from "drizzle-orm";

export async function signup(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing)
      return res.status(409).json({ error: "Email already in use" });
    const [created] = await db
      .insert(users)
      .values({ name, email, passwordHash, role: role || "operator" })
      .returning();
    const accessToken = signAccessToken({ id: created.id, role: created.role });
    const refreshToken = signRefreshToken({
      id: created.id,
      role: created.role,
    });
    setAuthCookies(res, accessToken, refreshToken);
    return res.status(201).json({
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to signup , " + err });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: "Invalid email or password" });
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });
    setAuthCookies(res, accessToken, refreshToken);
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to login, " + err });
  }
}

export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(400).json({ error: "Missing refresh token" });
  try {
    const decoded = verifyRefreshToken(token);
    const accessToken = signAccessToken({ id: decoded.id, role: decoded.role });
    setAccessCookie(res, accessToken);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    const successResponse = { message: "If the email exists, an OTP was sent" };
    if (!user) return res.json(successResponse);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const ttlMinutes = Number(process.env.PASSWORD_RESET_TTL_MIN || 15);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Store OTP directly on the user record
    await db
      .update(users)
      .set({ resetOtp: otp, resetOtpExpiresAt: expiresAt })
      .where(eq(users.email, email));

    const appName = process.env.APP_NAME || "Manufacturing CMS";
    const subject = `${appName} Password Reset Code`;
    const html = `
      <p>Use the following code to reset your password:</p>
      <h2 style="letter-spacing:4px;">${otp}</h2>
      <p>This code expires in ${ttlMinutes} minutes.</p>
    `;
    try {
      await sendMail({ to: email, subject, html });
    } catch {}
    return res.json(successResponse);
  } catch (err) {
    return res.status(500).json({ error: "Failed to process request" });
  }
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body || {};
  if (!email || !otp || !newPassword)
    return res.status(400).json({ error: "Missing fields" });
  try {
    const now = new Date();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.resetOtp || !user.resetOtpExpiresAt)
      return res.status(400).json({ error: "Invalid code" });
    if (user.resetOtp !== otp)
      return res.status(400).json({ error: "Invalid code" });
    if (new Date(user.resetOtpExpiresAt) < now)
      return res.status(400).json({ error: "Code expired" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash }).where(eq(users.email, email));

    // Clear OTP fields after successful reset
    await db
      .update(users)
      .set({ resetOtp: null, resetOtpExpiresAt: null })
      .where(eq(users.email, email));

    return res.json({ message: "Password updated" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset password" });
  }
}

export async function logout(req, res) {
  clearAuthCookies(res);
  return res.json({ ok: true });
}

function setAuthCookies(res, accessToken, refreshToken) {
  setAccessCookie(res, accessToken);
  res.cookie("refreshToken", refreshToken, cookieOptions(true));
}

function setAccessCookie(res, accessToken) {
  res.cookie("accessToken", accessToken, cookieOptions());
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", cookieOptions());
  res.clearCookie("refreshToken", cookieOptions(true));
}

function cookieOptions(isRefresh = false) {
  const maxAge = isRefresh
    ? parseDurationToMs(process.env.REFRESH_TOKEN_TTL || "7d")
    : parseDurationToMs(process.env.ACCESS_TOKEN_TTL || "15m");
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge,
    path: "/",
  };
}

function parseDurationToMs(input) {
  if (!input) return undefined;
  if (/^\d+$/.test(input)) return Number(input) * 1000;
  const match = input.match(/^(\d+)([smhd])$/);
  if (!match) return undefined;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return value * unitMs;
}
