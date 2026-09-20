import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()

  // Re-run reveal observer and sticky header on every route change
  useEffect(() => {
    // ---- Sticky header: add .scrolled class on scroll ----
    const header = document.querySelector('.site-header')
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (header) header.classList.toggle('scrolled', window.scrollY > 24)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // ---- Scroll-reveal: add .in-view to .reveal elements ----
    const revealEls = document.querySelectorAll('.reveal')
    let observer
    if (revealEls.length > 0 && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
      revealEls.forEach((el) => observer.observe(el))
    } else {
      revealEls.forEach((el) => el.classList.add('in-view'))
    }

    // Scroll to top on route change
    window.scrollTo(0, 0)

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (observer) observer.disconnect()
    }
  }, [location.pathname])

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
