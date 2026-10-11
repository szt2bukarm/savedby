import gsap from 'gsap'

export function animateSlotMachine(
  element: HTMLElement, 
  endStr: string, 
  tl?: gsap.core.Timeline, 
  colorAnimation?: boolean,
  oldStr: string = ""
) {
  const oldWidth = element.getBoundingClientRect().width
  gsap.killTweensOf(element, colorAnimation ? 'width,color' : 'width')
  element.innerHTML = ''
  element.style.width = 'auto'
  element.style.display = 'inline-flex'
  element.style.alignItems = 'center'
  element.style.justifyContent = 'flex-end'
  element.style.whiteSpace = 'nowrap'
  
  let lastDigitIdx = -1
  for (let i = endStr.length - 1; i >= 0; i--) {
    if (/\d/.test(endStr[i])) { lastDigitIdx = i; break }
  }
  const sameLength = !!oldStr && oldStr.length === endStr.length
  const changedIdx: number[] = []
  if (sameLength) {
    for (let i = 0; i < endStr.length; i++) {
      if (oldStr[i] !== endStr[i]) changedIdx.push(i)
    }
  }
  const isSimpleTick =
    sameLength &&
    lastDigitIdx >= 0 &&
    changedIdx.length === 1 &&
    changedIdx[0] === lastDigitIdx &&
    /\d/.test(oldStr[lastDigitIdx]) &&
    Number(endStr[lastDigitIdx]) === Number(oldStr[lastDigitIdx]) + 1

  const slotsToAnimate: HTMLElement[] = []
  
  for (let i = 0; i < endStr.length; i++) {
    const char = endStr[i]
    const shouldAnimate = !oldStr || oldStr.length !== endStr.length || oldStr[i] !== char
    if (/\d/.test(char) && shouldAnimate) {
      const colWrap = document.createElement('span')
      colWrap.style.display = 'inline-flex'
      colWrap.style.flexDirection = 'column'
      colWrap.style.height = '1.05em'
      colWrap.style.overflow = 'hidden'
      colWrap.style.paddingRight = '0.1em'
      colWrap.style.marginRight = '-0.1em'
      
      const colInner = document.createElement('span')
      colInner.style.display = 'flex'
      colInner.style.flexDirection = 'column'
      colInner.style.alignItems = 'center'

      if (isSimpleTick) {
        const oldCell = document.createElement('span')
        oldCell.style.display = 'block'
        oldCell.style.position = 'relative'
        oldCell.style.height = '1.05em'
        oldCell.style.width = '0px'

        const oldText = document.createElement('span')
        oldText.innerText = oldStr[i]
        oldText.style.position = 'absolute'
        oldText.style.left = '50%'
        oldText.style.top = '50%'
        oldText.style.transform = 'translate(-50%, -50%)'

        oldCell.appendChild(oldText)
        colInner.appendChild(oldCell)

        const newCell = document.createElement('span')
        newCell.style.display = 'flex'
        newCell.style.alignItems = 'center'
        newCell.style.justifyContent = 'center'
        newCell.style.height = '1.05em'
        newCell.innerText = char
        colInner.appendChild(newCell)
      } else {
        for (let j = 0; j < 8; j++) {
          const fakeChar = document.createElement('span')
          fakeChar.style.display = 'block'
          fakeChar.style.position = 'relative'
          fakeChar.style.height = '1.05em'
          fakeChar.style.width = '0px'
          
          const fakeText = document.createElement('span')
          fakeText.innerText = Math.floor(Math.random() * 10).toString()
          fakeText.style.position = 'absolute'
          fakeText.style.left = '50%'
          fakeText.style.top = '50%'
          fakeText.style.transform = 'translate(-50%, -50%)'
          
          fakeChar.appendChild(fakeText)
          colInner.appendChild(fakeChar)
        }
        const realChar = document.createElement('span')
        realChar.innerText = char
        realChar.style.display = 'flex'
        realChar.style.alignItems = 'center'
        realChar.style.justifyContent = 'center'
        realChar.style.height = '1.05em'
        colInner.appendChild(realChar)
      }
      
      colWrap.appendChild(colInner)
      element.appendChild(colWrap)
      slotsToAnimate.push(colInner)
    } else {
      const span = document.createElement('span')
      span.innerText = char
      span.style.display = 'flex'
      span.style.alignItems = 'center'
      span.style.height = '1.05em'
      element.appendChild(span)
    }
  }

  const animationTl = tl || gsap.timeline()

  if (colorAnimation) {
    gsap.set(element, { color: '#10B981' })
    animationTl.to(element, { color: '#000000', duration: 1.5, ease: 'power2.out' }, 0.5)
  }

  const newWidth = element.getBoundingClientRect().width

  if (oldWidth > 0 && Math.abs(oldWidth - newWidth) > 0.5) {
    if (newWidth < oldWidth) {
      element.style.justifyContent = 'flex-start'
    } else {
      element.style.justifyContent = 'flex-end'
    }
    element.style.overflow = 'hidden'

    animationTl.fromTo(element, { width: oldWidth }, {
      width: newWidth,
      duration: 0.6,
      ease: 'power2.out',
      immediateRender: true,
      overwrite: 'auto',
      clearProps: 'width,overflow',
      onComplete: () => {
        element.style.justifyContent = 'flex-end'
      }
    }, 0)
  }

  slotsToAnimate.forEach((slot, idx) => {
    if (isSimpleTick) {
      animationTl.fromTo(slot, { yPercent: 0, filter: 'blur(3px)' }, {
        yPercent: -50,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power3.out',
      }, 0)
      return
    }
    animationTl.fromTo(slot, { yPercent: 0, filter: 'blur(5px)' }, {
      yPercent: -(100 * 8 / 9),
      filter: 'blur(0px)',
      duration: 1 + (idx * 0.2),
      ease: 'back.out(0.6)',
    }, 0)
  })

  return animationTl
}
