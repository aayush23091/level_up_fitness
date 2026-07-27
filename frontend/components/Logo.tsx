import Image from "next/image";

interface LogoProps {
  size?: "navbar" | "sidebar" | "auth" | "mobile";
  className?: string;
}

const dimensions = {
  navbar: { width: 160, height: 50 },
  sidebar: { width: 180, height: 55 },
  auth: { width: 200, height: 65 },
  mobile: { width: 130, height: 40 },
};

const containerClasses = {
  navbar: "",
  sidebar: "flex justify-center",
  auth: "flex justify-center",
  mobile: "flex justify-center",
};

export default function Logo({ size = "navbar", className = "" }: LogoProps) {
  const { width, height } = dimensions[size];

  return (
    <div className={containerClasses[size]}>
      <Image
        src="/logo.png"
        alt="LevelUp Fitness"
        width={width}
        height={height}
        className={`object-contain ${className}`}
        priority
      />
    </div>
  );
}
