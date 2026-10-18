import { createContext, useState, useEffect } from "react";

export const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);

  // Khi load app, kiểm tra sessionStorage
  useEffect(() => {
    const storedDoctor = sessionStorage.getItem("doctor");
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
    }
  }, []);

  // Hàm login
  const login = (data) => {
    sessionStorage.setItem("doctor", JSON.stringify(data)); 
    setDoctor(data); 
  };

  // Hàm logout
  const logout = () => {
    sessionStorage.removeItem("doctor");
    setDoctor(null);
  };

  // Hàm đổi mật khẩu
  const changePassword = (updatedDoctor) => {
    setDoctor(updatedDoctor);
    sessionStorage.setItem("doctor", JSON.stringify(updatedDoctor));
  };

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, logout, login, changePassword }}>
      {children}
    </DoctorContext.Provider>
  );
};
