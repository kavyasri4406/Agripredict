export interface FarmProfile {
  landSize: number; // in Acres
  soilType: string;
  irrigationType: string;
  primaryCrops: string[];
}

export interface User {
  name: string;
  email: string;
  password: string;
  location: string; // state + district combination
  state: string;
  district: string;
  role: string;
  avatar: string;
  portfolio: string[];
  farmProfile?: FarmProfile;
  createdAt: string;
}

const USERS_KEY = "agri_users";
const CURRENT_KEY = "agri_current_user";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}

function saveUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const AVATARS = ["🌾", "🌱", "🚜", "🌻", "🥕", "🌿", "🍃", "🫘"];

export function register(
  name: string,
  email: string,
  password: string,
  state: string,
  district: string
): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email already registered. Please sign in." };
  }
  const user: User = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    location: `${district}, ${state}`,
    state,
    district,
    role: "Farmer",
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    portfolio: ["rice", "wheat", "tomato", "mustard"],
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return { success: true };
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { success: false, error: "No account found with this email. Please register." };
  if (user.password !== password) return { success: false, error: "Incorrect password. Please try again." };
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  return { success: true };
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); } catch { return null; }
}

export function updatePortfolio(email: string, portfolio: string[]) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx >= 0) {
    users[idx].portfolio = portfolio;
    saveUsers(users);
    // Update current session
    const current = getCurrentUser();
    if (current && current.email === email) {
      current.portfolio = portfolio;
      localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
    }
  }
}

export function updateUserLocation(email: string, state: string, district: string) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx >= 0) {
    users[idx].state = state;
    users[idx].district = district;
    users[idx].location = `${district}, ${state}`;
    saveUsers(users);
    // Update current session
    const current = getCurrentUser();
    if (current && current.email === email) {
      current.state = state;
      current.district = district;
      current.location = `${district}, ${state}`;
      localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
    }
  }
}

export function updateUserProfile(email: string, name: string, role: string, avatar: string) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx >= 0) {
    users[idx].name = name.trim();
    users[idx].role = role;
    users[idx].avatar = avatar;
    saveUsers(users);
    // Update current session
    const current = getCurrentUser();
    if (current && current.email === email) {
      current.name = name.trim();
      current.role = role;
      current.avatar = avatar;
      localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
    }
  }
}

export function updateFarmProfile(email: string, farmProfile: FarmProfile) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx >= 0) {
    users[idx].farmProfile = farmProfile;
    saveUsers(users);
    const current = getCurrentUser();
    if (current && current.email === email) {
      current.farmProfile = farmProfile;
      localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
    }
  }
}
