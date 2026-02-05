interface ServiGoLogoProps {
  size?: "small" | "medium" | "large"
  className?: string
}

export function ServiGoLogo({ size = "medium", className = "" }: ServiGoLogoProps) {
  const dimensions = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 180, height: 180 },
  }

  const { width, height } = dimensions[size]

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src="/assets/img/logo.png" 
        alt="ServiGo Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  )
}
