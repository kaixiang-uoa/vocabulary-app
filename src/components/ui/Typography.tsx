import React from "react";

export interface TypographyProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  strong?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TextProps {
  children: React.ReactNode;
  strong?: boolean;
  type?: "secondary" | "success" | "warning" | "danger";
  className?: string;
  style?: React.CSSProperties;
}

export interface TitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  style?: React.CSSProperties;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  level = 1,
  strong = false,
  className = "",
  style,
}) => {
  const levelClasses = {
    1: "text-4xl font-bold",
    2: "text-3xl font-bold",
    3: "text-2xl font-semibold",
    4: "text-xl font-semibold",
    5: "text-lg font-medium",
  };

  const strongClasses = strong ? "font-bold" : "";
  const classes = `${levelClasses[level]} ${strongClasses} text-gray-900 ${className}`;

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};

const Text: React.FC<TextProps> = ({
  children,
  strong = false,
  type,
  className = "",
  style,
}) => {
  const typeClasses = {
    secondary: "text-gray-500",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  const strongClasses = strong ? "font-semibold" : "";
  const classes = `text-base ${type ? typeClasses[type] : "text-gray-700"} ${strongClasses} ${className}`;

  return (
    <span className={classes} style={style}>
      {children}
    </span>
  );
};

const Title: React.FC<TitleProps> = ({
  children,
  level = 1,
  className = "",
  style,
}) => {
  return (
    <Typography level={level} className={className} style={style}>
      {children}
    </Typography>
  );
};

export { Text, Title };
export default Typography;
