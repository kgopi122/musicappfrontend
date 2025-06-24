// Check if user is logged in
export const isLoggedIn = () => {
  const hasCsrid = document.cookie.includes('csrid=');
  const hasUsername = localStorage.getItem('username');
  return hasCsrid && hasUsername;
};

// Redirect to login if not authenticated
export const requireAuth = (navigate) => {
  if (!isLoggedIn()) {
    navigate('/login');
    return false;
  }
  return true;
}; 