type ContainerProps = {
    className?: string;
    children: any;
};

const Container = ({ className, children }: ContainerProps) => {
    return <div className={`w-4/5 m-auto ${className}`}>{children}</div>;
};

export default Container;
