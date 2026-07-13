import React, { lazy, Suspense } from 'react';
import Hero from '../components/home/Hero';

// Lazy load below-the-fold components
const AboutUs = lazy(() => import('../components/home/AboutUs'));
const Services = lazy(() => import('../components/home/Services'));
const HowItWorks = lazy(() => import('../components/home/HowItWorks'));
const Articles = lazy(() => import('../components/home/Articles'));
const Testimonials = lazy(() => import('../components/home/Testimonials'));
const ContactUs = lazy(() => import('../components/home/ContactUs'));
const CTA = lazy(() => import('../components/home/CTA'));

export default function LandingPage() {
    return (
        <>
            <Hero />
            <Suspense fallback={<div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}>
                <AboutUs />
                <Services />
                <HowItWorks />
                <Articles />
                <Testimonials />
                <ContactUs />
                <CTA />
            </Suspense>
        </>
    );
}
