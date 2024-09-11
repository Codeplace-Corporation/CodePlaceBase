import React from "react";
import { Link, LinkProps } from "react-router-dom";

type StyledButtonProps = {
    variant?:
        | "primary"
        | "secondary"
        | "inactive"
        | "success"
        | "danger"
        | "outline";
    size?: "small" | "medium" | "large";
    className?: string;
    to?: string;
    onClick?: () => void;
    disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonBaseStyles = `
  inline-flex
  items-center
  justify-center
  font-medium
  rounded-md
  transition
  ease-linear
  cursor-pointer
`;

const sizeStyles = {
    small: "px-2 py-2 text-xs",
    medium: "px-3 py-2 text-sm",
    large: "px-6 py-3 text-base",
};

const variantStyles = {
    primary: `
    bg-white/10
    text-white
    hover:bg-white/15
  `,
    inactive: `
    bg-transparent
    text-white/50
    hover:bg-white/15
  `,
    outline: `
    text-white
    border
    border-white
    hover:bg-white
    hover:text-black 
  `,
    secondary: `
    bg-white
    text-black
    hover:bg-white-600
    hover:text-primary
  `,
    success: `
    bg-accent
    text-white
    hover:bg-accent/50
    `,
    danger: `
    bg-red-600 
    text-white 
    hover:bg-red-700 
  `,
};

const StyledButton: React.FC<StyledButtonProps> = ({
    variant = "primary",
    size = "medium",
    to,
    onClick,
    disabled,
    children,
    className,
    ...rest
}) => {
    const classes = `
    ${buttonBaseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

    if (to) {
        const linkProps: LinkProps = {
            to,
            className: classes,
            ...rest,
        } as LinkProps;

        return <Link {...linkProps}>{children}</Link>;
    }

    return (
        <button
            onClick={onClick}
            className={classes}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
};

export default StyledButton;
