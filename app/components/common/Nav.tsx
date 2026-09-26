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
        <nav className="fixed z-[100] top-0 left-0 w-full px-[20px] md:px-[40px] lg:px-[80px] xl:px-[120px] py-[30px] md:py-[40px] max-h-sm:py-[25px] flex items-center justify-between pointer-events-none">

            <img src={"/assets/logo.svg"} className='lg:absolute lg:left-1/2 lg:-translate-1/2 lg:top-[60px] lg:max-h-sm:top-[45px] w-[100px] md:w-[145px] md:h-[42px] pointer-events-auto' />

            <div className="hidden lg:flex gap-[27px] pointer-events-auto">

                <div className="flex gap-[7px] items-center">
                <p className="text-[18px] text-background font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-75 transition-[filter] duration-150">Merchants</p>
                <AnchorDown />
                </div>

                <div className="flex gap-[7px] items-center">
                <p className="text-[18px] text-background font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-75 transition-[filter] duration-150">Shoppers</p>
                <AnchorDown />
                </div>

            </div>

            <div className="hidden md:flex gap-[27px] pointer-events-auto items-center">

                <p className="text-[18px] text-background font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-75 transition-[filter] duration-150">File a claim</p>
                <Button href="/" className="px-[18px]! py-[5px]! text-[18px]! border-[2px]!" text="Get Started" ></Button>
 
            </div>

        </nav>
    )
}