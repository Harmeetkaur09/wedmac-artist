export function Footer() {
  return (
    <footer className="bg-[#FF577F] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <div className="space-y-2">
              <p>📞 619-393-4981 Ext. 101</p>
              <p>✉️ Invest@AtlasLPS.Com</p>
              <p>📍 501 West Broadway, Suite 800, San Diego, CA 92101</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Links</h3>
            <div className="space-y-2">
              <p>FAQs</p>
              <p>Disclosures</p>
              <p>Terms And Conditions</p>
              <p>Privacy Policy</p>
              <p>Submit Deals</p>
              <p>Media Kit</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Investment Disclosure</h3>
            <p className="text-sm">
              When you invest with Atlas, you are more than a number; you are a partner. As a partner with us, you can
              access opportunities usually reserved only for the largest institutional investors. You can access a team
              driven only by excellence and results. You can access real estate investment opportunities designed with
              you in mind.
            </p>
          </div>
        </div>
        <div className="border-t border-pink-400 mt-8 pt-8 text-center">
          <p>ATLAS 2022 © All Right Reserved</p>
        </div>
      </div>
    </footer>
  )
}
