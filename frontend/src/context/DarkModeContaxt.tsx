import { createContext, useContext, useState, useEffect } from "react";

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
);

function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // onload like function to get body
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDark(newMode);
    document.body.classList.toggle("dark", newMode);
    // if the newMode == true, then it is dark mode
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error("useDarkMode needs DarkModeProvider");
  return context;
};

export { DarkModeContext, DarkModeProvider };
