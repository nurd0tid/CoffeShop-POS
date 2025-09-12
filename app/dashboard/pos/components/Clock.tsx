"use client";

import { useEffect, useState } from "react";

export default function Clock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("id-ID", {
          hour12: false,
          timeZone: "Asia/Jakarta",
        })
      );
    };
    update(); // set awal
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {time}
    </span>
  );
}
