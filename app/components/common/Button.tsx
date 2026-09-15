
interface ButtonProps {
    text: string;
    href: string;
    className?: string;
    onClick?: () => void;
}

export default function Button({ text, href, className = '', onClick }: ButtonProps) {
    return (
        <button className={`font-riforma-regular px-[64px] py-[16px] bg-brand-orange border-[3px] border-background text-background tracking-[-0.5px] text-center hover:bg-black cursor-pointer transition-colors ${className}`} onClick={onClick}>
            {text}
        </button>
    )
}