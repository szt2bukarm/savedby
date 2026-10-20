"use client"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAppContext, useNavColor } from "@/app/AppContext"
import Button from "../common/Button"
import SavedByLogo from "./SavedByLogo"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import Box from "./Box"
import { Link } from "next-view-transitions"
gsap.registerPlugin(CustomEase)

const AnchorDown = ({ color } : {color:string}) => {
    return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="8" viewBox="0 0 13 8" fill="none">
        <path className="transition-colors duration-150" d="M0.729202 0.729202L6.2292 6.2292L11.7292 0.729202" stroke={color == "light" ? "#FDF6E2" : "#110F0B"} strokeWidth="2.0625"/>
    </svg>
    )
}

const FALLBACK_BG = "#FDF6E2"

// brand-orange is #FD4015 -> rgb(253, 64, 21)
const isBrandOrange = (color: string) => {
    const m = color.match(/\d+(\.\d+)?/g)
    if (!m || m.length < 3) return false
    const [r, g, b] = m.map(Number)
    return Math.abs(r - 253) <= 2 && Math.abs(g - 64) <= 2 && Math.abs(b - 21) <= 2
}

const MASK = (() => {
    const steps = 8
    const stops = Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps
        const alpha = 1 - t * t * (3 - 2 * t)
        return `rgba(0,0,0,${alpha.toFixed(4)}) ${(t * 100).toFixed(2)}%`
    })
    return `linear-gradient(to bottom, ${stops.join(", ")})`
})()

export interface NavLink {
  _id: string;
  text: string;
  href: string;
}

export interface NavDropdown {
  _type: 'navDropdown';
  _key: string;
  text: string;
  links: NavLink[];
}

export interface NavButton {
  _type: 'navButton';
  _key: string;
  text: string;
  href: string;
  variant: 'default' | 'transparent';
}

const Arrow = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="74" height="59" viewBox="0 0 74 59" fill="none">
            <path d="M41.2031 3.49512L66.5 29.3669L41.2031 55.2386" stroke="#FDF6E2" strokeWidth="10" strokeMiterlimit="10"/>
            <path d="M65 29.4951H0" stroke="#FDF6E2" strokeWidth="10"/>
        </svg>
    )
}

export type DropdownItem = NavDropdown | (NavLink & { _type: 'reference', _key: string });

export interface NavData {
  _id: string;
  dropdowns?: DropdownItem[];
  buttons?: NavButton[];
}

const NavDropdownLink = ({ link }: { link: NavLink }) => {
    const rowRef = useRef<HTMLAnchorElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        gsap.set("[data-gsap='nav-bold']", { yPercent: 110 });
        gsap.set("[data-gsap='nav-arrow-inner']", { xPercent: -100 });

        tl.current = gsap.timeline({ paused: true, defaults: { ease: NAV_EASE, duration: 0.4 } })
        .to("[data-gsap='nav-regular']", { yPercent: -110 }, 0)
        .to("[data-gsap='nav-bold']", { yPercent: 0 }, 0)
        .to("[data-gsap='nav-arrow']", { width: 94 }, 0)
        .to("[data-gsap='nav-arrow-inner']", { xPercent: 0 }, 0)
    }, { scope: rowRef, dependencies: [link.text] });

    return (
        <Link
            ref={rowRef}
            href={link.href}
            data-gsap="nav-dropdown-link"
            onMouseEnter={() => tl.current?.play()}
            onMouseLeave={() => tl.current?.reverse()}
            className="flex w-fit items-center text-desktop-h3 leading-[110%] tracking-[-2%] text-background"
        >
            <div data-gsap='nav-arrow' className="w-0 overflow-hidden shrink-0">
                <div data-gsap='nav-arrow-inner' className="w-[94px] shrink-0 box-border pr-[20px]">
                    <Arrow />
                </div>
            </div>
            <span className="grid overflow-hidden pb-[0.1em]">
                <span data-gsap='nav-regular' className="[grid-area:1/1] font-riforma-regular whitespace-nowrap">{link.text}</span>
                <span data-gsap='nav-bold' aria-hidden className="[grid-area:1/1] font-riforma-bold whitespace-nowrap">{link.text}</span>
            </span>
        </Link>
    )
}

const NAV_EASE = "navDropdownEase"
const NAV_COLOR_RESET_DELAY = 0.23
const HIDDEN_CLIP = "inset(0% 0% 100% 0%)"
const SHOWN_CLIP = "inset(0% 0% 0% 0%)"

const SLIDE_DISTANCE = 50

const NavDropdown = memo(function NavDropdown({ items, direction, all, onClosed }: { items: NavDropdown | null, direction: 1 | -1, all: NavDropdown[], onClosed: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const isOpen = useRef(false);
    const closeCall = useRef<gsap.core.Tween | null>(null);
    const [displayed, setDisplayed] = useState<NavDropdown | null>(items);
    const wasOpen = useRef(false);
    const slideInPending = useRef(false);

    useGSAP(() => {
        if (!items) { wasOpen.current = false; return; }
        if (!displayed || !wasOpen.current || displayed === items) {
            gsap.killTweensOf(listRef.current);
            gsap.set(listRef.current, { x: 0, opacity: 1 });
            setDisplayed(items);
        } else {
            gsap.to(listRef.current, {
                x: -direction * SLIDE_DISTANCE,
                opacity: 0,
                duration: 0.10,
                ease: NAV_EASE,
                overwrite: true,
                onComplete: () => {
                    slideInPending.current = true;
                    setDisplayed(items);
                },
            })
        }
        wasOpen.current = true;
    }, { dependencies: [items], scope: containerRef });

    useGSAP(() => {
        if (!slideInPending.current) return;
        slideInPending.current = false;
        gsap.fromTo(listRef.current, { x: direction * SLIDE_DISTANCE, opacity: 0 }, {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: NAV_EASE,
            overwrite: true,
        })
    }, { dependencies: [displayed], scope: containerRef });

    useGSAP(() => {
        if (!CustomEase.get(NAV_EASE)) CustomEase.create(NAV_EASE, "0.25, 0.1, 0.25, 1");
        gsap.set("[data-gsap='nav-orange'],[data-gsap='nav-blue']", { clipPath: HIDDEN_CLIP, y: -200 });
    }, { scope: containerRef });

    useGSAP(() => {
        const open = !!items;
        if (open === isOpen.current) return;
        isOpen.current = open;

        closeCall.current?.kill();

        if (open) {
            gsap.to("[data-gsap='nav-orange'],[data-gsap='nav-blue']", {
                clipPath: SHOWN_CLIP,
                y: 0,
                ease: NAV_EASE,
                stagger: 0.15,
                duration: 0.5,
                overwrite: true,
            })
        } else {
            gsap.to([
                containerRef.current!.querySelector("[data-gsap='nav-blue']"),
                containerRef.current!.querySelector("[data-gsap='nav-orange']"),
            ], {
                clipPath: HIDDEN_CLIP,
                y: -200,
                ease: NAV_EASE,
                stagger: 0.05,
                duration: 0.5,
                overwrite: true,
            })
            closeCall.current = gsap.delayedCall(NAV_COLOR_RESET_DELAY, onClosed)
        }
    }, { dependencies: [!!items], scope: containerRef });

    const open = !!items;

    return (
        <div ref={containerRef} style={{viewTransitionName: "nav-dropdown"}} className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
            <div className="relative w-full">
                {/* invisible hover zone extending below the panel so slipping off the content doesn't close it */}
                <div className={`absolute top-0 left-0 w-full h-full ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} />
                <div data-gsap="nav-orange" className="absolute inset-0 bg-brand-orange" style={{ clipPath: HIDDEN_CLIP }} />
                <div data-gsap="nav-blue" className={`relative bg-brand-blue pt-[150px] pb-[120px] px-[110px] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ clipPath: HIDDEN_CLIP }}>
                    <div className="grid">
                        {all.map((dd) => (
                            <div key={dd._key} aria-hidden inert className="invisible [grid-area:1/1] flex flex-col gap-[30px]">
                                {dd.links?.map((link) => (
                                    <NavDropdownLink key={link._id || link.href} link={link} />
                                ))}
                            </div>
                        ))}
                        <div ref={listRef} className="[grid-area:1/1] flex flex-col gap-[30px]">
                            {displayed?.links?.map((link) => (
                                <NavDropdownLink key={link._id || link.href} link={link} />
                            ))}
                        </div>
                    </div>
                    <Box className="absolute right-[-50px] bottom-0 w-[550px]"/>
                </div>
            </div>
        </div>
    )
})

export default function Nav({ data }: { data?: NavData }) {

    const {navHidden} = useAppContext();
    const navColor = useNavColor();
    const gradientRef = useRef<HTMLDivElement>(null);
    const [isOrange, setIsOrange] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<NavDropdown | null>(null);
    const [direction, setDirection] = useState<1 | -1>(1);
    // stays true while the dropdown is open or still animating closed
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const lastIndex = useRef<number | null>(null);

    const openDropdown = (item: NavDropdown, index: number) => {
        if (lastIndex.current !== null && index !== lastIndex.current) {
            setDirection(index > lastIndex.current ? 1 : -1);
        }
        lastIndex.current = index;
        setActiveDropdown(item);
        setDropdownVisible(true);
    };

    // sample the opaque background color of whatever is behind the nav
    useEffect(() => {
        if (navColor === "light") return;
        let raf = 0;
        let last = "";

        const sample = () => {
            raf = 0;
            const el = gradientRef.current;
            if (!el) return;
            const stack = document.elementsFromPoint(window.innerWidth / 2, 8);
            let color = FALLBACK_BG;
            for (const node of stack) {
                if (node.closest("nav")) continue;
                // only blocks explicitly opted in via data-navcolorlistener are considered
                const listener = node.closest("[data-navcolorlistener]");
                if (!listener) continue;
                const bg = getComputedStyle(listener).backgroundColor;
                if (bg && bg !== "transparent" && !/rgba?\(.*,\s*0\)$/.test(bg) && !/\/\s*0\)$/.test(bg)) {
                    color = bg;
                }
                break;
            }
            if (color === last) return;
            last = color;
            setIsOrange(isBrandOrange(color));
            el.style.backgroundColor = color;
        };

        // elementsFromPoint + getComputedStyle force style/layout work, so on scroll sample at
        // most every 80ms instead of every frame (the colour only changes at block boundaries)
        let lastRun = 0;
        const schedule = () => {
            if (raf) return;
            raf = requestAnimationFrame((now) => {
                if (now - lastRun < 80) { raf = 0; return; }
                lastRun = now;
                sample();
            });
        };
        sample();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        // catches Lenis/transform-based scrolling and layout changes
        const interval = window.setInterval(schedule, 150);
        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            window.clearInterval(interval);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [navColor]);

    const handleDropdownClosed = useCallback(() => setDropdownVisible(false), []);
    const allDropdowns = useMemo(
        () => (data?.dropdowns ?? []).filter((d): d is NavDropdown => d._type === 'navDropdown'),
        [data?.dropdowns]
    );

    const effectiveNavColor = (activeDropdown || dropdownVisible) ? 'light' : navColor;

    return (
        <nav style={{viewTransitionName: "nav"}} onMouseLeave={() => setActiveDropdown(null)} className={`fixed z-[100] top-0 left-0 w-full px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px] py-[30px] sm:py-[40px] max-h-sm:py-[25px] flex items-center justify-between pointer-events-none transition-opacity duration-300 ${navHidden ? 'opacity-0' : 'opacity-100'}`}>
            <div ref={gradientRef} style={{
                backgroundColor: FALLBACK_BG,
                maskImage: MASK,
                WebkitMaskImage: MASK,
            }} className={`${effectiveNavColor === "light" ? "opacity-0" : "opacity-100"} transition-[opacity,background-color] duration-300 fixed top-0 left-0 right-0 w-full h-[130px] z-10`}></div>

            <Link href={"/"} className={`lg:absolute lg:left-1/2 lg:-translate-1/2 lg:top-[60px] lg:max-h-sm:top-[45px] w-[100px] sm:w-[145px] sm:h-[42px] z-20 ${navHidden ? 'pointer-events-none' : 'pointer-events-auto'}`}>
            <SavedByLogo color={effectiveNavColor == "light" ? "#FDF6E2" : "#110F0B"} className="
            transition-colors duration-300 w-full h-full" />
            </Link>

            <div className={`hidden lg:flex gap-[27px] z-20 ${navHidden ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                {data?.dropdowns?.map((item, index) => 
                    item._type === 'navDropdown' ? (
                        <button onMouseEnter={() => openDropdown(item, index)} key={item._key} className={`flex gap-[7px] items-center ${activeDropdown && activeDropdown._key !== item._key ? 'brightness-75' : ''} transition-[filter] duration-150`}>
                            <p className={`${effectiveNavColor === 'light' ? 'text-background' : 'text-black'} text-[18px] font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer transition-colors duration-150`}>{item.text}</p>
                            <AnchorDown color={effectiveNavColor}/>
                        </button>
                    ) : (
                        <a key={item._key} href={item.href} className={`${effectiveNavColor === 'light' ? 'text-background' : 'text-black'} ${activeDropdown ? 'brightness-75' : ''} text-[18px] font-riforma-bold tracking-[-0.5px] leading-[110%] cursor-pointer hover:brightness-100 transition-[filter,color] duration-150`}>{item.text}</a>
                    )
                )}
            </div>

            <div className={`hidden sm:flex gap-[10px] items-center z-20 ${navHidden ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                {data?.buttons?.map((btn) => 
                    <Button key={btn._key} href={btn.href} className={`px-[22px]! py-[4px]! text-[18px]! border-[2px]! ${btn.variant === "transparent" ? `${effectiveNavColor !== "light" ? "bg-background! text-black! border-black! hover:bg-black! hover:text-white!" : "bg-transparent!"} ${effectiveNavColor !== "light" ? "" : "hover:bg-white! hover:text-black!"}` : `bg-brand-orange ${effectiveNavColor !== "light" ? (isOrange ? "border-background!" : "border-brand-orange!") : ""}`}` } text={btn.text} />
                )}
            </div>

            <NavDropdown items={activeDropdown} direction={direction} onClosed={handleDropdownClosed} all={allDropdowns} />
            <div className={`fixed top-0 left-0 w-screen h-screen bg-black/50 z-5 pointer-events-none transition-opacity duration-500 ${dropdownVisible ? 'opacity-100' : 'opacity-0'}`} />
        </nav>
    )
}