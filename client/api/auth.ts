import { http } from "./http";

type SignupBody = {
  name: string;
  email: string;
  password: string;
  role?: string;
};
type LoginBody = { email: string; password: string };

export async function signup(body: SignupBody) {
  const { data } = await http.post("/auth/signup", body);
  return data;
}

export async function login(body: LoginBody) {
  const { data } = await http.post("/auth/login", body);
  return data;
}

export async function refresh() {
  const { data } = await http.post("/auth/refresh");
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await http.post("/auth/forgot-password", { email });
  return data;
}

export async function logout() {
  const { data } = await http.post("/auth/logout");
  return data;
}
