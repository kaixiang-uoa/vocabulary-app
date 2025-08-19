import React from "react";

export interface SkeletonProps {
  // Shape variants
  variant?: "text" | "circular" | "rectangular" | "rounded";

  // Size variants
  size?: "small" | "medium" | "large" | "extra-large";

  // Custom dimensions
  width?: string | number;
  height?: string | number;

  // Animation
  animation?: "pulse" | "wave" | "none";

  // Additional props
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> & {
  Text: React.FC<Omit<SkeletonProps, "variant">>;
  Circle: React.FC<Omit<SkeletonProps, "variant">>;
  Rectangle: React.FC<Omit<SkeletonProps, "variant">>;
  Rounded: React.FC<Omit<SkeletonProps, "variant">>;
} = ({
  variant = "text",
  size = "medium",
  width,
  height,
  animation = "pulse",
  className = "",
  style,
}) => {
  // Size classes
  const sizeClasses = {
    small: {
      text: "h-3",
      circular: "w-6 h-6",
      rectangular: "h-3",
      rounded: "h-3 rounded",
    },
    medium: {
      text: "h-4",
      circular: "w-8 h-8",
      rectangular: "h-4",
      rounded: "h-4 rounded",
    },
    large: {
      text: "h-6",
      circular: "w-12 h-12",
      rectangular: "h-6",
      rounded: "h-6 rounded",
    },
    "extra-large": {
      text: "h-8",
      circular: "w-16 h-16",
      rectangular: "h-8",
      rounded: "h-8 rounded",
    },
  };

  // Animation classes
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: "",
  };

  // Base classes
  const baseClasses = "bg-gray-200 rounded";

  // Variant-specific classes
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded",
  };

  // Combine classes
  const classes = [
    baseClasses,
    sizeClasses[size][variant],
    variantClasses[variant],
    animationClasses[animation],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Custom dimensions
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
  };

  return (
    <div
      className={classes}
      style={customStyle}
      aria-label="Loading skeleton"
    />
  );
};

// Compound components for common use cases
Skeleton.Text = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="text" {...props} />
);

Skeleton.Circle = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="circular" {...props} />
);

Skeleton.Rectangle = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="rectangular" {...props} />
);

Skeleton.Rounded = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="rounded" {...props} />
);

export default Skeleton;
