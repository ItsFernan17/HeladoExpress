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
  const [hora, setHora] = useState(horaGT());
  useEffect(() => {
    const id = setInterval(() => setHora(horaGT()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#E61429] text-white">
      <nav
        className={`mx-auto w-full px-6 py-2 flex items-center justify-between ${paytone.className}`}
      >
        {/* Izquierda: logo + helado + texto */}
        <div className="flex items-center gap-4  ml-10">
          <Image
            src="/images/logo_sarita.webp"
            alt="Sarita"
            width={170}
            height={54}
            priority
          />

          <div className="flex items-center gap-2">
            {/* Ícono EXACTO 25x37 */}
            <Image
              src="/icons/icon_helado.webp"
              alt="Ícono helado"
              width={25}
              height={37}
              className="w-[25px] h-[37px]"
              priority
            />
            {/* Texto EXACTO 15px en #FFFFFF */}
            <div className="leading-none text-white  text-center">
              <div className="text-[20px]">Franquicia</div>
              <div className="text-[20px] mt-1">Chuscaj</div>
            </div>
          </div>
        </div>

        {/* Derecha: hora (12h con AM/PM) + estado */}
        <div className="text-right leading-tight text-white mr-10">
          <div className="text-[42px] tracking-tight">{hora}</div>
          <div className="text-[26px] -mt-1">Conectado al Servidor</div>
        </div>
      </nav>
    </header>
  );
}
