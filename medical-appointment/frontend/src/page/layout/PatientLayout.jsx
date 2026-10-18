import React from "react";
import { Outlet } from "react-router-dom";  
import Header from "../../component/Header";
import NavBar from "../../component/NavBar";
import Footer from "../../component/Footer";

export default function PatientLayout() {
  return (
    <>
      <Header />
      <NavBar />
      <div>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
