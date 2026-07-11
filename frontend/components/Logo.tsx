import Image from "next/image";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const dimensions = {
  small: { width: 32, height: 32 },
  medium: { width: 40, height: 40 },
  large: { width: 56, height: 56 },
};

export default function Logo({ size = "medium", className = "" }: LogoProps) {
  const { width, height } = dimensions[size];

  return (
    <Image
      src="/logo.png"
      alt="LevelUp Fitness"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );
}
