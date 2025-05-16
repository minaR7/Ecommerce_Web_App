export const getLoggedInUser = () => {
    const user = localStorage.getItem('user');
    // const token = localStorage.getItem('token');
    // if (token && user) return JSON.parse(user);
    if (user) return JSON.parse(user);
    return null;
  };
  