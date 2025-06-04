type StyledInputProps = {
    variant?: "outline" | "filled";
    inputSize?: "small" | "medium" | "large";
    className?: string;
    disabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

type StyledInputAreaProps = {
    variant?: "outline" | "filled";
    inputSize?: "small" | "medium" | "large";
    className?: string;
    disabled?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const inputBaseStyles = `
    rounded-md
    text-white
    focus:outline-none
`;

const sizeStyles = {
    small: "px-2 py-2 text-xs",
    medium: "px-2 py-2 text-sm",
    large: "px-2 py-3 text-base",
};

const variantStyles = {
    outline: `
    border
    border-white
    bg-transparent
    `,
    filled: `
    bg-white/10
    `,
};

const StyledInput: React.FC<StyledInputProps> = ({
    inputSize = "medium",
    variant = "outline",
    disabled,
    className,
    ...rest
}) => {
    const classes = `
    ${inputBaseStyles}
    ${sizeStyles[inputSize]}
    ${variantStyles[variant]}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
    `;

    return (
        <input
            className={classes}
            {...rest}
        />
    );
};

const StyledInputArea: React.FC<StyledInputAreaProps> = ({
    inputSize = "medium",
    variant = "outline",
    disabled,
    className,
    ...rest
}) => {
    const classes = `
        ${inputBaseStyles}
        ${sizeStyles[inputSize]}
        ${variantStyles[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
        `;
    return (
        <textarea
            className={classes}
            {...rest}
        />
    );
};

export { StyledInput, StyledInputArea };
