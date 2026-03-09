export const authService = {
  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  },
  getToken(): string | null {
    return localStorage.getItem("token");
  },
  getUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};