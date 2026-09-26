
interface ButtonProps {
    text: string;
    href: string;
    className?: string;
    onClick?: () => void;
}

export default function Button({ text, href, className = '', onClick }: ButtonProps) {
    return (
        <button className={`font-riforma-regular bg-brand-orange border-[3px] border-background text-background tracking-[-3%] text-center hover:bg-black cursor-pointer transition-colors ${className}`} onClick={onClick}>
            {text}
        </button>
    )
}