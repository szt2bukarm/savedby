"use client"
import Button from "../common/Button"

const AnchorDown = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="8" viewBox="0 0 13 8" fill="none">
  <path d="M0.729202 0.729202L6.2292 6.2292L11.7292 0.729202" stroke="#FDF6E2" strokeWidth="2.0625"/>
</svg>
    )
}

export default function Nav() {
    return (
        <nav className="fixed z-[100] h-[120px] top-0 left-0 w-screen px-[120px] py-[40px] flex items-center justify-between pointer-events-none">
            <img src={"/assets/logo.svg"} className='absolute left-1/2 -translate-1/2 top-[60px] w-[145px] h-[42px] pointer-events-auto' />

            <div className="flex gap-[27px] pointer-events-auto">

                <div className="flex gap-[7px] items-center">
                <p className="text-[18px] text-background font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-75 transition-[filter] duration-150">Merchants</p>
                <AnchorDown />
                </div>

                <div className="flex gap-[7px] items-center">
                <p className="text-[18px] text-background font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-75 transition-[filter] duration-150">Shoppers</p>
                <AnchorDown />
                </div>

            </div>

            <div className="flex gap-[27px] pointer-events-auto items-center">

                <p className="text-[18px] text-background font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-75 transition-[filter] duration-150">File a claim</p>
                <Button href="/" className="px-[18px]! py-[5px]! text-[18px]! border-[2px]!" text="Get Started" ></Button>
 
            </div>

        </nav>
    )
}