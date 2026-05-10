import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import Services from '@/components/Services'
import WhyUs from '@/components/WhyUs'
import Benefits from '@/components/Benefits'
import Dropshipping from '@/components/Dropshipping'
import Testimonials from '@/components/Testimonials'
import Gallery from '@/components/Gallery'
import LeadForm from '@/components/LeadForm'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <WhyUs />
      <Benefits />
      <Dropshipping />
      <Testimonials />
      <Gallery />
      <LeadForm />
      <CTA />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}
