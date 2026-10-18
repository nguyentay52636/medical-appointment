import { createContext, useState, useEffect } from "react";

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);

  // Khi load app, kiểm tra sessionStorage để giữ đăng nhập
  useEffect(() => {
    const storedPatient = sessionStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    }
  }, []);

  // Hàm login
  const login = (data) => {
    sessionStorage.setItem("patient", JSON.stringify(data));
    setPatient(data);
  };

  // Hàm logout
  const logout = () => {
    sessionStorage.removeItem("patient");
    setPatient(null);
  };

  // Hàm cập nhật thông tin cá nhân
  const updatePatientInfo  = (updatedInfo) => {
    if (!patient) return;
    const newPatient = { ...patient, ...updatedInfo };
    setPatient(newPatient);
    sessionStorage.setItem("patient", JSON.stringify(newPatient)); // lưu lại thay đổi
  };

  return (
    <PatientContext.Provider
      value={{ patient, setPatient, login, logout, updatePatientInfo }}
    >
      {children}
    </PatientContext.Provider>
  );
};
