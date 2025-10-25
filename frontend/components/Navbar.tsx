"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Paytone_One } from "next/font/google";

const paytone = Paytone_One({ subsets: ["latin"], weight: "400" });

// Hora Guatemala en 12h con AM/PM
function horaGT() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h12", // formato 12 horas
    timeZone: "America/Guatemala",
  }).format(new Date());
}

export default function Navbar() {
  const [hora, setHora] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true);
    // Establecer hora inicial
    setHora(horaGT());
    
    // Configurar intervalo para la hora
    const timeInterval = setInterval(() => setHora(horaGT()), 1000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#E61429] text-white">
      <nav
        className={`mx-auto w-full px-3 sm:px-6 py-2 flex items-center justify-between ${paytone.className}`}
      >
        {/* Izquierda: logo + helado + texto */}
        <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-6">
          <Image
            src="/images/logo_sarita.webp"
            alt="Sarita"
            width={140}
            height={44}
            className="w-20 h-auto sm:w-[140px]"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Ícono EXACTO 25x37 */}
            <Image
              src="/icons/icon_helado.webp"
              alt="Ícono helado"
              width={25}
              height={37}
              className="w-4 h-6 sm:w-[25px] sm:h-[37px]"
              priority
            />
            {/* Texto EXACTO 15px en #FFFFFF */}
            <div className="leading-none text-white text-center">
              <div className="text-xs sm:text-[18px]">Franquicia</div>
              <div className="text-xs sm:text-[18px] sm:mt-1">Chuscaj</div>
            </div>
          </div>
        </div>

        {/* Derecha: hora (12h con AM/PM) */}
        <div className="text-right leading-tight text-white mr-2 sm:mr-6">
          <div className="text-lg sm:text-[38px] tracking-tight min-w-[80px] sm:min-w-[120px]">
            {isClient ? hora : "--:-- --"}
          </div>
          <div className="text-xs sm:text-[22px] -mt-1">
            Guatemala
          </div>
        </div>
      </nav>
    </header>
  );
}
