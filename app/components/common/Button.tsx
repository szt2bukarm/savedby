
interface ButtonProps {
    text: string;
    href: string;
    className?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    dataGsap?: string;
}

export default function Button({ text, href, className = '', onClick, onMouseEnter, onMouseLeave, dataGsap }: ButtonProps) {
    return (
        <button data-gsap={dataGsap} className={`font-riforma-regular bg-brand-orange border-[3px] rounded-[10px] border-background text-background tracking-[-3%] text-center hover:bg-[#ff7252] cursor-pointer transition-colors w-fit ${className}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {text}
        </button>
    )
}