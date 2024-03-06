const isAuthenticated = () => {
  // Check if the user is authenticated (e.g., check token in local storage)
  return localStorage.getItem("token") !== null;
};

export default isAuthenticated;
